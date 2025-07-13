import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { KnowledgeBaseArticle } from '@/lib/types';

export interface KnowledgeBaseArticleDocument extends Omit<KnowledgeBaseArticle, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  slug?: string;
  tags?: string[];
  views?: number;
  isArchived?: boolean;
  version?: number;
  previousVersions?: string[];
}

export interface KnowledgeBaseCategoryDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description?: string;
  parentCategory?: string;
  isActive: boolean;
  articleCount?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseTagDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description?: string;
  color?: string;
  articleCount?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeBaseService {
  private static async getArticlesCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<KnowledgeBaseArticleDocument>('kb_articles');
  }

  private static async getCategoriesCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<KnowledgeBaseCategoryDocument>('kb_categories');
  }

  private static async getTagsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<KnowledgeBaseTagDocument>('kb_tags');
  }

  // Article Management
  static async getAllArticles(
    orgId: string,
    filters?: {
      category?: string;
      type?: 'Internal' | 'Public';
      author?: string;
      tag?: string;
      searchQuery?: string;
      isArchived?: boolean;
      visibleTo?: string[];
    }
  ): Promise<KnowledgeBaseArticle[]> {
    const collection = await this.getArticlesCollection();
    
    const query: any = { orgId };
    
    if (filters?.category) {
      query.category = filters.category;
    }
    
    if (filters?.type) {
      query.type = filters.type;
    }
    
    if (filters?.author) {
      query.author = filters.author;
    }
    
    if (filters?.tag) {
      query.tags = { $in: [filters.tag] };
    }
    
    if (filters?.isArchived !== undefined) {
      query.isArchived = filters.isArchived;
    } else {
      query.isArchived = { $ne: true }; // Default to non-archived
    }
    
    if (filters?.visibleTo && filters.visibleTo.length > 0) {
      query.visibleTo = { $in: filters.visibleTo };
    }
    
    if (filters?.searchQuery) {
      query.$or = [
        { title: { $regex: filters.searchQuery, $options: 'i' } },
        { content: { $regex: filters.searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.searchQuery, 'i')] } }
      ];
    }

    const articles = await collection
      .find(query)
      .sort({ lastUpdated: -1 })
      .toArray();

    return articles.map(this.articleDocumentToArticle);
  }

  static async getArticleById(id: string, orgId: string): Promise<KnowledgeBaseArticle | null> {
    const collection = await this.getArticlesCollection();
    const article = await collection.findOne({ _id: new ObjectId(id), orgId });
    
    if (!article) return null;
    
    // Increment view count
    await collection.updateOne(
      { _id: new ObjectId(id), orgId },
      { $inc: { views: 1 }, $set: { updatedAt: new Date() } }
    );
    
    return this.articleDocumentToArticle(article);
  }

  static async getArticleBySlug(slug: string, orgId: string): Promise<KnowledgeBaseArticle | null> {
    const collection = await this.getArticlesCollection();
    const article = await collection.findOne({ slug, orgId });
    
    if (!article) return null;
    
    // Increment view count
    await collection.updateOne(
      { slug, orgId },
      { $inc: { views: 1 }, $set: { updatedAt: new Date() } }
    );
    
    return this.articleDocumentToArticle(article);
  }

  static async getPublicArticles(orgId: string): Promise<KnowledgeBaseArticle[]> {
    return this.getAllArticles(orgId, { type: 'Public' });
  }

  static async getInternalArticles(orgId: string): Promise<KnowledgeBaseArticle[]> {
    return this.getAllArticles(orgId, { type: 'Internal' });
  }

  static async getArticlesByCategory(orgId: string, category: string): Promise<KnowledgeBaseArticle[]> {
    return this.getAllArticles(orgId, { category });
  }

  static async searchArticles(orgId: string, query: string, filters?: {
    type?: 'Internal' | 'Public';
    category?: string;
    visibleTo?: string[];
  }): Promise<KnowledgeBaseArticle[]> {
    return this.getAllArticles(orgId, {
      searchQuery: query,
      ...filters
    });
  }

  static async createArticle(
    orgId: string,
    articleData: Omit<KnowledgeBaseArticle, 'id'>,
    createdBy: string
  ): Promise<KnowledgeBaseArticle> {
    const collection = await this.getArticlesCollection();
    
    const now = new Date();
    const slug = this.generateSlug(articleData.title);
    
    const articleDocument: Omit<KnowledgeBaseArticleDocument, '_id'> = {
      ...articleData,
      orgId,
      slug,
      tags: articleData.tags || [],
      views: 0,
      isArchived: false,
      version: 1,
      previousVersions: [],
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      publishedAt: articleData.type === 'Public' ? now : undefined,
    };

    const result = await collection.insertOne(articleDocument);
    
    // Update category article count
    if (articleData.category) {
      await this.updateCategoryArticleCount(orgId, articleData.category);
    }
    
    // Update tag article counts
    if (articleData.tags && articleData.tags.length > 0) {
      await Promise.all(
        articleData.tags.map(tag => this.updateTagArticleCount(orgId, tag))
      );
    }
    
    const createdArticle = await collection.findOne({ _id: result.insertedId });
    if (!createdArticle) throw new Error('Failed to create article');
    
    return this.articleDocumentToArticle(createdArticle);
  }

  static async updateArticle(
    id: string,
    orgId: string,
    updates: Partial<Omit<KnowledgeBaseArticle, 'id'>>,
    updatedBy: string
  ): Promise<KnowledgeBaseArticle | null> {
    const collection = await this.getArticlesCollection();
    
    const currentArticle = await collection.findOne({ _id: new ObjectId(id), orgId });
    if (!currentArticle) return null;
    
    const now = new Date();
    const updateData: any = {
      ...updates,
      updatedBy,
      updatedAt: now,
      lastUpdated: now.toISOString()
    };

    // Update slug if title changed
    if (updates.title && updates.title !== currentArticle.title) {
      updateData.slug = this.generateSlug(updates.title);
    }

    // Handle publishing
    if (updates.type === 'Public' && currentArticle.type !== 'Public') {
      updateData.publishedAt = now;
    }

    // Version tracking for content changes
    if (updates.content && updates.content !== currentArticle.content) {
      updateData.version = (currentArticle.version || 1) + 1;
      updateData.previousVersions = [
        ...(currentArticle.previousVersions || []),
        JSON.stringify({
          version: currentArticle.version || 1,
          content: currentArticle.content,
          updatedAt: currentArticle.updatedAt,
          updatedBy: currentArticle.updatedBy
        })
      ];
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    // Update category counts if category changed
    if (updates.category && updates.category !== currentArticle.category) {
      await Promise.all([
        this.updateCategoryArticleCount(orgId, currentArticle.category),
        this.updateCategoryArticleCount(orgId, updates.category)
      ]);
    }
    
    // Update tag counts if tags changed
    const oldTags = currentArticle.tags || [];
    const newTags = updates.tags || oldTags;
    if (JSON.stringify(oldTags.sort()) !== JSON.stringify(newTags.sort())) {
      await Promise.all([
        ...oldTags.map(tag => this.updateTagArticleCount(orgId, tag)),
        ...newTags.map(tag => this.updateTagArticleCount(orgId, tag))
      ]);
    }
    
    return this.articleDocumentToArticle(result);
  }

  static async archiveArticle(id: string, orgId: string, updatedBy: string): Promise<boolean> {
    const collection = await this.getArticlesCollection();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id), orgId },
      { 
        $set: { 
          isArchived: true, 
          updatedBy, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.matchedCount > 0;
  }

  static async deleteArticle(id: string, orgId: string): Promise<boolean> {
    const collection = await this.getArticlesCollection();
    const article = await collection.findOne({ _id: new ObjectId(id), orgId });
    
    if (!article) return false;
    
    const result = await collection.deleteOne({ _id: new ObjectId(id), orgId });
    
    if (result.deletedCount > 0) {
      // Update category and tag counts
      await this.updateCategoryArticleCount(orgId, article.category);
      if (article.tags && article.tags.length > 0) {
        await Promise.all(
          article.tags.map(tag => this.updateTagArticleCount(orgId, tag))
        );
      }
      return true;
    }
    
    return false;
  }

  // Category Management
  static async getAllCategories(orgId: string): Promise<Array<{ name: string; articleCount: number; description?: string }>> {
    const collection = await this.getCategoriesCollection();
    
    const categories = await collection
      .find({ orgId, isActive: true })
      .sort({ name: 1 })
      .toArray();

    return categories.map(cat => ({
      name: cat.name,
      articleCount: cat.articleCount || 0,
      description: cat.description
    }));
  }

  static async createCategory(
    orgId: string,
    name: string,
    description?: string,
    createdBy: string = 'system',
    parentCategory?: string
  ): Promise<void> {
    const collection = await this.getCategoriesCollection();
    
    const now = new Date();
    await collection.insertOne({
      orgId,
      name,
      description,
      parentCategory,
      isActive: true,
      articleCount: 0,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
    });
  }

  private static async updateCategoryArticleCount(orgId: string, categoryName: string): Promise<void> {
    const articlesCollection = await this.getArticlesCollection();
    const categoriesCollection = await this.getCategoriesCollection();
    
    const count = await articlesCollection.countDocuments({ 
      orgId,
      category: categoryName,
      isArchived: { $ne: true }
    });
    
    await categoriesCollection.updateOne(
      { orgId, name: categoryName },
      { 
        $set: { articleCount: count, updatedAt: new Date() },
        $setOnInsert: { 
          orgId,
          name: categoryName,
          isActive: true,
          createdBy: 'system',
          updatedBy: 'system',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  // Tag Management
  static async getAllTags(orgId: string): Promise<Array<{ name: string; articleCount: number; color?: string }>> {
    const collection = await this.getTagsCollection();
    
    const tags = await collection
      .find({ orgId })
      .sort({ articleCount: -1, name: 1 })
      .toArray();

    return tags.map(tag => ({
      name: tag.name,
      articleCount: tag.articleCount || 0,
      color: tag.color
    }));
  }

  static async createTag(
    orgId: string,
    name: string,
    description?: string,
    color?: string,
    createdBy: string = 'system'
  ): Promise<void> {
    const collection = await this.getTagsCollection();
    
    const now = new Date();
    await collection.insertOne({
      orgId,
      name,
      description,
      color,
      articleCount: 0,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
    });
  }

  private static async updateTagArticleCount(orgId: string, tagName: string): Promise<void> {
    const articlesCollection = await this.getArticlesCollection();
    const tagsCollection = await this.getTagsCollection();
    
    const count = await articlesCollection.countDocuments({ 
      orgId,
      tags: tagName,
      isArchived: { $ne: true }
    });
    
    await tagsCollection.updateOne(
      { orgId, name: tagName },
      { 
        $set: { articleCount: count, updatedAt: new Date() },
        $setOnInsert: { 
          orgId,
          name: tagName,
          createdBy: 'system',
          updatedBy: 'system',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  // Statistics
  static async getStats(orgId: string): Promise<{
    total: number;
    public: number;
    internal: number;
    archived: number;
    categories: number;
    tags: number;
    byCategory: Record<string, number>;
    topTags: Array<{ name: string; count: number }>;
    recentlyUpdated: number;
    totalViews: number;
  }> {
    const articlesCollection = await this.getArticlesCollection();
    const categoriesCollection = await this.getCategoriesCollection();
    const tagsCollection = await this.getTagsCollection();
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const [
      total,
      publicCount,
      internal,
      archived,
      categories,
      tags,
      categoryCounts,
      topTags,
      recentlyUpdated,
      viewsResult
    ] = await Promise.all([
      articlesCollection.countDocuments({ orgId, isArchived: { $ne: true } }),
      articlesCollection.countDocuments({ orgId, type: 'Public', isArchived: { $ne: true } }),
      articlesCollection.countDocuments({ orgId, type: 'Internal', isArchived: { $ne: true } }),
      articlesCollection.countDocuments({ orgId, isArchived: true }),
      categoriesCollection.countDocuments({ orgId, isActive: true }),
      tagsCollection.countDocuments({ orgId }),
      articlesCollection.aggregate([
        { $match: { orgId, isArchived: { $ne: true } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray(),
      tagsCollection.find({ orgId }).sort({ articleCount: -1 }).limit(10).toArray(),
      articlesCollection.countDocuments({ 
        orgId,
        updatedAt: { $gte: oneWeekAgo },
        isArchived: { $ne: true }
      }),
      articlesCollection.aggregate([
        { $match: { orgId, isArchived: { $ne: true } } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]).toArray()
    ]);

    const byCategory: Record<string, number> = {};
    categoryCounts.forEach((item: any) => {
      byCategory[item._id] = item.count;
    });

    const topTagsFormatted = topTags.map(tag => ({
      name: tag.name,
      count: tag.articleCount || 0
    }));

    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    return {
      total,
      public: publicCount,
      internal,
      archived,
      categories,
      tags,
      byCategory,
      topTags: topTagsFormatted,
      recentlyUpdated,
      totalViews
    };
  }

  // Utility Methods
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private static articleDocumentToArticle(doc: KnowledgeBaseArticleDocument): KnowledgeBaseArticle {
    const { _id, orgId, createdBy, updatedBy, createdAt, updatedAt, publishedAt, slug, tags, views, isArchived, version, previousVersions, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest,
      tags: tags || []
    };
  }
}