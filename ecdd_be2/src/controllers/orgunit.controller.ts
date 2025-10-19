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
            as: 'children',
          }]
        }]
      });
      return ResponseUtil.success(res, tree);
    } catch (error: any) {
      console.error('Get tree error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, parentid, pageSize, ...otherFilters } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};

      if (parentid !== undefined && parentid !== '' && parentid !== null) {
        whereClause.parentid = Number(parentid);
      }

      if (otherFilters.level !== undefined && otherFilters.level !== '' && otherFilters.level !== null) {
        whereClause.level = Number(otherFilters.level);
      }

      const options: any = {
        limit: Number(limit),
        offset,
        where: whereClause
      };

      const { count, rows } = await OrgUnit.findAndCountAll(options);

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
}
