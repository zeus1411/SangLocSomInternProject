import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Period } from '../models/Period';
import { ResponseUtil } from '../utils/response.util';

export class PeriodController extends BaseController<Period> {
  constructor() {
    super(Period);
  }

  async getActive(req: Request, res: Response) {
    try {
      const periods = await Period.findAll({
        where: { isactive: true },
        order: [['fromdate', 'DESC']]
      });
      return ResponseUtil.success(res, periods);
    } catch (error: any) {
      console.error('Get active periods error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
