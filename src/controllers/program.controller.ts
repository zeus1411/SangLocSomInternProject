import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Program } from '../models/Program';
import { Form } from '../models/Form';
import { FormMember } from '../models/FormMember';
import { Dataset } from '../models/Dataset';
import { ResponseUtil } from '../utils/response.util';

export class ProgramController extends BaseController<Program> {
  constructor() {
    super(Program);
  }

  async getWithForms(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const program = await Program.findByPk(id, {
        include: [{
          model: Form,
          as: 'forms'
        }]
      });

      if (!program) return ResponseUtil.notFound(res, 'Program not found');
      return ResponseUtil.success(res, program);
    } catch (error: any) {
      console.error('Get program with forms error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
