import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Form } from '../models/Form';
import { FormMember } from '../models/FormMember';
import { Dataset } from '../models/Dataset';
import { DatasetMember } from '../models/DatasetMember';
import { DataElement } from '../models/DataElement';
import { ResponseUtil } from '../utils/response.util';
import { cacheGet, cacheSet, cacheDel, cacheDelPrefix, buildKey } from '../utils/cache.util';

export class FormController extends BaseController<Form> {
  private entity = 'form';

  constructor() {
    super(Form);
  }

  async getFormStructure(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cacheKey = buildKey([this.entity, id, 'structure']);

      // Try to get from cache first
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        return ResponseUtil.success(res, cached);
      }

      // If not in cache, fetch from database
      const form = await Form.findByPk(id, {
        include: [{
          model: FormMember,
          as: 'formMembers',
          include: [{
            model: Dataset,
            as: 'dataset',
            include: [{
              model: DatasetMember,
              as: 'datasetMembers',
              include: [{
                model: DataElement,
                as: 'dataelement'
              }]
            }]
          }]
        }]
      });

      if (!form) return ResponseUtil.notFound(res, 'Form not found');
      
      // Cache the result
      await cacheSet(cacheKey, form);
      
      return ResponseUtil.success(res, form);
    } catch (error: any) {
      console.error('Get form structure error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // Override create method to invalidate cache
  async create(req: Request, res: Response) {
    try {
      const result = await super.create(req, res);
      await this.invalidateAfterWrite();
      return result;
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  // Override update method to invalidate cache
  async update(req: Request, res: Response) {
    try {
      const result = await super.update(req, res);
      await this.invalidateAfterWrite(req.params.id);
      return result;
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  // Override delete method to invalidate cache
  async delete(req: Request, res: Response) {
    try {
      const result = await super.delete(req, res);
      await this.invalidateAfterWrite(req.params.id);
      return result;
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  // Invalidate relevant cache entries
  private async invalidateAfterWrite(id?: string | number) {
    if (id !== undefined) {
      // Invalidate single form cache
      await cacheDel(buildKey([this.entity, id]));
      // Invalidate form structure cache
      await cacheDel(buildKey([this.entity, id, 'structure']));
    }
    // Invalidate all form lists
    await cacheDelPrefix(this.entity + ':list');
  }
}
