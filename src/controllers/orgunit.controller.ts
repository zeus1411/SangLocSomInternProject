import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { OrgUnit } from '../models/Orgunit';
import { ResponseUtil } from '../utils/response.util';

export class OrgUnitController extends BaseController<OrgUnit> {
  constructor() {
    super(OrgUnit);
  }

  async getTree(req: Request, res: Response) {
    try {
      const tree = await OrgUnit.findAll({
        where: { parentid: null },
        include: [{
          model: OrgUnit,
          as: 'children',
          include: [{
            model: OrgUnit,
            as: 'children'
          }]
        }]
      });
      return ResponseUtil.success(res, tree);
    } catch (error: any) {
      console.error('Get tree error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
