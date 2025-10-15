import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { FormInstance } from '../models/FormInstance';
import {FormInstanceValue} from '../models/FormInstanceValue';
import {Form} from '../models/Form';
import {OrgUnit} from '../models/Orgunit';
import {Period} from '../models/Period';
import {DataElement} from '../models/DataElement';
import {DatasetMember} from '../models/DatasetMember';
import { ResponseUtil } from '../utils/response.util';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFormInstanceDto, UpdateFormInstanceDto } from '../dtos/forminstance.dto';

export class FormInstanceController extends BaseController<FormInstance> {
    constructor() {
      super(FormInstance);
    }
  
    // CREATE FormInstance với Values
    async createWithValues(req: Request, res: Response) {
      try {
        const dto = plainToClass(CreateFormInstanceDto, req.body);
        const errors = await validate(dto);
  
        if (errors.length > 0) {
          return ResponseUtil.badRequest(res, 'Validation failed', errors);
        }
  
        // Create FormInstance
        const formInstance = await FormInstance.create({
          personid: dto.personid,
          name: dto.name,
          birthday: dto.birthday,
          address: dto.address,
          months: dto.months,
          formid: dto.formid,
          description: dto.description,
          gender: dto.gender,
          parentname: dto.parentname,
          phone: dto.phone,
          surveyby: dto.surveyby,
          surveyplace: dto.surveyplace,
          periodid: dto.periodid,
          orgunitid: dto.orgunitid,
          provinceid: dto.provinceid,
          districtid: dto.districtid,
          createddate: new Date(),
          createdby: req.user?.username || 'system'
        });
  
        // Create FormInstanceValues if provided
        if (dto.values && dto.values.length > 0) {
          const values = dto.values.map(v => ({
            forminstanceid: formInstance.id,
            datasetmemberid: v.datasetmemberid,
            dataelementid: v.dataelementid,
            value: v.value,
            createddate: new Date(),
            createdby: req.user?.username || 'system'
          }));
  
          await FormInstanceValue.bulkCreate(values);
        }
  
        // Load complete data
        const result = await FormInstance.findByPk(formInstance.id, {
          include: [{
            model: FormInstanceValue,
            as: 'formInstanceValues'
          }]
        });
  
        return ResponseUtil.created(res, result, 'Form instance created successfully');
      } catch (error: any) {
        console.error('Create FormInstance error:', error);
        return ResponseUtil.error(res, error.message);
      }
    }
  
    // UPDATE FormInstance với Values
    async updateWithValues(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const dto = plainToClass(UpdateFormInstanceDto, req.body);
        const errors = await validate(dto);
  
        if (errors.length > 0) {
          return ResponseUtil.badRequest(res, 'Validation failed', errors);
        }
  
        const formInstance = await FormInstance.findByPk(id);
        if (!formInstance) {
          return ResponseUtil.notFound(res, 'Form instance not found');
        }
  
        // Update FormInstance
        await formInstance.update({
          personid: dto.personid,
          name: dto.name,
          birthday: dto.birthday,
          address: dto.address,
          months: dto.months,
          formid: dto.formid,
          description: dto.description,
          ispasses: dto.ispasses,
          gender: dto.gender,
          parentname: dto.parentname,
          phone: dto.phone,
          surveyby: dto.surveyby,
          surveyplace: dto.surveyplace,
          periodid: dto.periodid,
          orgunitid: dto.orgunitid,
          provinceid: dto.provinceid,
          districtid: dto.districtid
        });
  
        // Update Values if provided
        if (dto.values && dto.values.length > 0) {
          // Delete old values
          await FormInstanceValue.destroy({
            where: { forminstanceid: formInstance.id }
          });
  
          // Create new values
          const values = dto.values.map(v => ({
            forminstanceid: formInstance.id,
            datasetmemberid: v.datasetmemberid,
            dataelementid: v.dataelementid,
            // valueid: v.valueid,
            value: v.value,
            createddate: new Date(),
            createdby: req.user?.username || 'system'
          }));
  
          await FormInstanceValue.bulkCreate(values);
        }
  
        // Load complete data
        const result = await FormInstance.findByPk(formInstance.id, {
          include: [{
            model: FormInstanceValue,
            as: 'formInstanceValues'
          }]
        });
  
        return ResponseUtil.updated(res, result, 'Form instance updated successfully');
      } catch (error: any) {
        console.error('Update FormInstance error:', error);
        return ResponseUtil.error(res, error.message);
      }
    }
  
    // GET FormInstance with complete data
    async getComplete(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const formInstance = await FormInstance.findByPk(id, {
          include: [
            {
              model: FormInstanceValue,
              as: 'formInstanceValues',
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
            }
          ]
        });
  
        if (!formInstance) {
          return ResponseUtil.notFound(res, 'Form instance not found');
        }
  
        return ResponseUtil.success(res, formInstance);
      } catch (error: any) {
        console.error('Get complete FormInstance error:', error);
        return ResponseUtil.error(res, error.message);
      }
    }
  
    // GET all FormInstances with filters
    async getAllWithFilters(req: Request, res: Response) {
      try {
        const { page = 1, limit = 10, formid, periodid, orgunitid } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
  
        const where: any = {};
        if (formid) where.formid = formid;
        if (periodid) where.periodid = periodid;
        if (orgunitid) where.orgunitid = orgunitid;
  
        const { count, rows } = await FormInstance.findAndCountAll({
          where,
          limit: Number(limit),
          offset,
          include: [
            { model: Form, as: 'form' },
            { model: OrgUnit, as: 'orgunit' },
            { model: Period, as: 'period' }
          ],
          order: [['createddate', 'DESC']]
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
        console.error('Get all FormInstances error:', error);
        return ResponseUtil.error(res, error.message);
      }
    }
  }
  
