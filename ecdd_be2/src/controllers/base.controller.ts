import { Request, Response } from 'express';
import { Model, ModelStatic, FindOptions } from 'sequelize';
import { ResponseUtil } from '../utils/response.util';

// ===== add these imports =====
import { cacheGet, cacheSet, cacheDel, cacheDelPrefix, buildKey } from '../utils/cache.util';

export class BaseController<T extends Model> {
  constructor(private model: ModelStatic<T>) {}

  // helper: tên entity cho key redis
  private entityName() {
    return this.model.name.toLowerCase(); // ví dụ 'Program' -> 'program'
  }

  // GET all with pagination and filters (cache list)
  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const options: FindOptions = {
        limit: Number(limit),
        offset,
        where: filters
      };

      // ---- CACHE SECTION (LIST) ----
      // tạo key duy nhất cho list này
      // Ta stringify các tham số để phân biệt page/limit/filter khác nhau
      const listKeyRaw = JSON.stringify({ page, limit, filters });
      const cacheKey = buildKey([this.entityName(), 'list', listKeyRaw]);

      // thử lấy cache
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        return ResponseUtil.success(res, cached); // cached đã có data + pagination
      }

      // nếu không có cache -> query DB
      const { count, rows } = await this.model.findAndCountAll(options);

      const responsePayload = {
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      };

      // lưu cache list
      await cacheSet(cacheKey, responsePayload);

      return ResponseUtil.success(res, responsePayload);
    } catch (error: any) {
      console.error('Get all error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // GET by ID (cache detail)
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cacheKey = buildKey([this.entityName(), id]);

      // thử lấy cache
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        return ResponseUtil.success(res, cached);
      }

      // không có cache -> DB
      const item = await this.model.findByPk(id);

      if (!item) {
        return ResponseUtil.notFound(res, 'Item not found');
      }

      // lưu cache
      await cacheSet(cacheKey, item);

      return ResponseUtil.success(res, item);
    } catch (error: any) {
      console.error('Get by ID error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // CREATE
  async create(req: Request, res: Response) {
    try {
      const item = await this.model.create(req.body);

      // Invalidate cache list (vì danh sách đã thay đổi)
      await cacheDelPrefix(this.entityName() + ':list');

      // Invalidate cache detail (phòng trường hợp có ai gọi trước create, thường không cần nhưng an toàn)
      const cacheKey = buildKey([this.entityName(), (item as any).id]);
      await cacheDel(cacheKey);

      return ResponseUtil.created(res, item);
    } catch (error: any) {
      console.error('Create error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // UPDATE
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await this.model.findByPk(id);

      if (!item) {
        return ResponseUtil.notFound(res, 'Item not found');
      }

      await item.update(req.body);

      // Invalidate cache detail
      const detailKey = buildKey([this.entityName(), id]);
      await cacheDel(detailKey);

      // Invalidate cache list (vì item trong list có thể đã thay đổi)
      await cacheDelPrefix(this.entityName() + ':list');

      return ResponseUtil.updated(res, item);
    } catch (error: any) {
      console.error('Update error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // DELETE
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await this.model.findByPk(id);

      if (!item) {
        return ResponseUtil.notFound(res, 'Item not found');
      }

      await item.destroy();

      // Invalidate cache detail
      const detailKey = buildKey([this.entityName(), id]);
      await cacheDel(detailKey);

      // Invalidate cache list
      await cacheDelPrefix(this.entityName() + ':list');

      return ResponseUtil.deleted(res);
    } catch (error: any) {
      console.error('Delete error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
