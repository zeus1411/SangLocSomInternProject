import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Form } from '../models/Form';
import {FormMember} from '../models/FormMember';
import { Dataset } from '../models/Dataset';
import { DatasetMember } from '../models/DatasetMember';
import { DataElement } from '../models/DataElement';
import { ResponseUtil } from '../utils/response.util';

export class FormController extends BaseController<Form> {
  constructor() {
    super(Form);
  }

  async getFormStructure(req: Request, res: Response) {
    try {
      const { id } = req.params;
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
      return ResponseUtil.success(res, form);
    } catch (error: any) {
      console.error('Get form structure error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
