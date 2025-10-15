import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { FormInstanceValue } from '../models/FormInstanceValue';
import {DataElement} from '../models/DataElement';
import {DatasetMember} from '../models/DatasetMember';
import { ResponseUtil } from '../utils/response.util';

export class FormInstanceValueController extends BaseController<FormInstanceValue> {
  constructor() {
    super(FormInstanceValue);
  }

  async getByFormInstance(req: Request, res: Response) {
    try {
      const { formInstanceId } = req.params;
      const values = await FormInstanceValue.findAll({
        where: { forminstanceid: formInstanceId },
        include: [
          {
            model: DataElement,
            as: 'dataElement'
          },
          {
            model: DatasetMember,
            as: 'datasetMember',
            include: [{
              model: DataElement,
              as: 'dataelement'  
            }]
          }
        ]
      });
      return ResponseUtil.success(res, values);
    } catch (error: any) {
      console.error('Get values by FormInstance error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
