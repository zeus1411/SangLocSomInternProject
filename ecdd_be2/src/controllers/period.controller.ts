import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Period } from '../models/Period';
import { ResponseUtil } from '../utils/response.util';
import { Op } from 'sequelize';

export class PeriodController extends BaseController<Period> {
  constructor() {
    super(Period);
  }

  // GET active periods (isactive = true)
  async getActive(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows } = await Period.findAndCountAll({
        where: {
          isactive: true
        },
        limit: Number(limit),
        offset,
        order: [['fromdate', 'DESC']]
      });

      console.log(`Found ${count} active periods`);

      if (rows.length === 0) {
        return ResponseUtil.success(res, {
          data: [],
          pagination: {
            total: 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: 0
          }
        }, 'No active periods found');
      }

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
      console.error('Get active periods error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // GET current period (lấy period gần nhất đang active)
  async getCurrent(req: Request, res: Response) {
    try {
      const today = new Date();

      // Tìm period đang active và ngày hiện tại nằm trong khoảng fromdate - todate
      const period = await Period.findOne({
        where: {
          isactive: true,
          fromdate: {
            [Op.lte]: today  // fromdate <= today
          },
          todate: {
            [Op.gte]: today  // todate >= today
          }
        },
        order: [['fromdate', 'DESC']]
      });

      if (!period) {
        // Nếu không tìm thấy period trong khoảng, tìm period active gần nhất
        const latestPeriod = await Period.findOne({
          where: {
            isactive: true
          },
          order: [['fromdate', 'DESC']]
        });

        if (!latestPeriod) {
          return ResponseUtil.success(res, {
            data: []
          }, 'No current period found');
        }

        return ResponseUtil.success(res, {
          data: [latestPeriod]
        });
      }

      return ResponseUtil.success(res, {
        data: [period]
      });
    } catch (error: any) {
      console.error('Get current period error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // GET all periods with pagination
  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, isactive } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (isactive !== undefined) {
        where.isactive = isactive === 'true';
      }

      const { count, rows } = await Period.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['fromdate', 'DESC']]
      });

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
      console.error('Get all periods error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // CREATE period
  async create(req: Request, res: Response) {
    try {
      const { code, name, note, fromdate, todate, isactive } = req.body;

      const period = await Period.create({
        code,
        name,
        note,
        fromdate,
        todate,
        isactive: isactive !== undefined ? isactive : true,
        createddate: new Date(),
        createdby: req.user?.email || 'system'
      });

      return ResponseUtil.created(res, period, 'Period created successfully');
    } catch (error: any) {
      console.error('Create period error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // UPDATE period
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, name, note, fromdate, todate, isactive } = req.body;

      const period = await Period.findByPk(id);
      if (!period) {
        return ResponseUtil.notFound(res, 'Period not found');
      }

      await period.update({
        code,
        name,
        note,
        fromdate,
        todate,
        isactive,
        updateddate: new Date(),
        updatedby: req.user?.email || 'system'
      });

      return ResponseUtil.updated(res, period, 'Period updated successfully');
    } catch (error: any) {
      console.error('Update period error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // DELETE period
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const period = await Period.findByPk(id);
      if (!period) {
        return ResponseUtil.notFound(res, 'Period not found');
      }

      await period.destroy();

      return ResponseUtil.success(res, null, 'Period deleted successfully');
    } catch (error: any) {
      console.error('Delete period error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}