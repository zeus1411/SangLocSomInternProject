import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Dataset } from '../models/Dataset';
import { DatasetMember } from '../models/DatasetMember';
import { DataElement } from '../models/DataElement';
import { ResponseUtil } from '../utils/response.util';

export class DatasetController extends BaseController<Dataset> {
  constructor() {
    super(Dataset);
  }

  async getWithMembers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dataset = await Dataset.findByPk(id, {
        include: [{
          model: DatasetMember,
          as: 'datasetMembers',
          include: [{
            model: DataElement,
            as: 'dataelement'
          }]
        }]
      });

      if (!dataset) return ResponseUtil.notFound(res, 'Dataset not found');
      return ResponseUtil.success(res, dataset);
    } catch (error: any) {
      console.error('Get dataset with members error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
