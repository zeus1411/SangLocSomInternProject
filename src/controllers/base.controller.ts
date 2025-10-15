import { Request, Response } from 'express';
import { Model, ModelStatic, FindOptions } from 'sequelize';
import { ResponseUtil } from '../utils/response.util';

// Generic CRUD Controller
export class BaseController<T extends Model> {
  constructor(private model: ModelStatic<T>) {}

  // GET all with pagination and filters
  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      const options: FindOptions = {
        limit: Number(limit),
        offset,
        where: filters
      };

      const { count, rows } = await this.model.findAndCountAll(options);

      return ResponseUtil.success(res, {
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get all error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // GET by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await this.model.findByPk(id);

      if (!item) {
        return ResponseUtil.notFound(res, 'Item not found');
      }

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
      return ResponseUtil.deleted(res);
    } catch (error: any) {
      console.error('Delete error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}