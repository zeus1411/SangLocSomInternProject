import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { FormInstance } from '../models/FormInstance';
import { FormInstanceValue } from '../models/FormInstanceValue';
import { Form } from '../models/Form';
import { OrgUnit } from '../models/Orgunit';
import { Period } from '../models/Period';
import { DataElement } from '../models/DataElement';
import { DatasetMember } from '../models/DatasetMember';
import { ResponseUtil } from '../utils/response.util';

export class FormInstanceController extends BaseController<FormInstance> {
  constructor() {
    super(FormInstance);
  }

  /**
   * CREATE FormInstance với 3 cases JWT handling
   */
  async createWithValues(req: Request, res: Response) {
    try {
      const { instance, values } = req.body;
      const now = new Date();
      
      // XÁC ĐỊNH createdBy và surveyNote
      let createdBy: string;
      let surveyNote: string | undefined;
      
      if (req.user?.email && req.user?.userId) {
        // CASE 2: Valid token - Use email from JWT
        createdBy = req.user.email;
        console.log(`✅ Case 2: Create by authenticated user: ${createdBy}`);
      } else {
        // CASE 3: No token - Use IP address
        createdBy = 'anonymous';
        surveyNote = `Created from IP: ${req.clientIp || 'unknown'} at ${now.toISOString()}`;
        console.log(`⚠️ Case 3: Create by anonymous user. ${surveyNote}`);
      }

      // Create FormInstance
      const formInstance = await FormInstance.create({
        personid: instance.personid,
        name: instance.name,
        birthday: instance.birthday,
        address: instance.address,
        months: instance.months,
        formid: instance.formid,
        description: instance.description,
        ispasses: instance.ispasses,
        gender: instance.gender,
        parentname: instance.parentname,
        phone: instance.phone,
        surveyby: instance.surveyby,
        surveyplace: instance.surveyplace,
        periodid: instance.periodid,
        orgunitid: instance.orgunitid,
        provinceid: instance.provinceid,
        districtid: instance.districtid,
        createddate: now,
        createdby: createdBy,
        surveyNote: surveyNote
      });

      // Create FormInstanceValues
      if (values && values.length > 0) {
        const valueRecords = values.map((v: any) => ({
          forminstanceid: formInstance.id,
          datasetmemberid: v.datasetmember?.id,
          dataelementid: v.datasetmember?.dataelementid,
          value: v.value,
          createddate: now,
          createdby: createdBy
        }));

        await FormInstanceValue.bulkCreate(valueRecords);
      }

      console.log(`✅ Created FormInstance #${formInstance.id} by ${createdBy}`);
      return ResponseUtil.created(res, formInstance, 'Tạo phiếu sàng lọc thành công');
      
    } catch (error: any) {
      console.error('❌ Create FormInstance error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * UPDATE FormInstance với 3 cases JWT handling
   */
  async updateWithValues(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { instance, values } = req.body;
      const now = new Date();

      const formInstance = await FormInstance.findByPk(id);
      if (!formInstance) {
        return ResponseUtil.notFound(res, 'Không tìm thấy phiếu sàng lọc');
      }

      // XÁC ĐỊNH updatedBy
      let updatedBy: string;
      let updateNote: string | undefined;
      
      if (req.user?.email && req.user?.userId) {
        // CASE 2: Valid token
        updatedBy = req.user.email;
        console.log(`✅ Case 2: Update by authenticated user: ${updatedBy}`);
      } else {
        // CASE 3: No token - Track IP
        updatedBy = 'anonymous';
        const existingNote = formInstance.surveyNote || '';
        updateNote = `${existingNote}\nUpdated from IP: ${req.clientIp || 'unknown'} at ${now.toISOString()}`;
        console.log(`⚠️ Case 3: Update by anonymous user. IP: ${req.clientIp}`);
      }

      // Update FormInstance
      await formInstance.update({
        personid: instance.personid,
        name: instance.name,
        birthday: instance.birthday,
        address: instance.address,
        months: instance.months,
        formid: instance.formid,
        description: instance.description,
        ispasses: instance.ispasses,
        gender: instance.gender,
        parentname: instance.parentname,
        phone: instance.phone,
        surveyby: instance.surveyby,
        surveyplace: instance.surveyplace,
        periodid: instance.periodid,
        orgunitid: instance.orgunitid,
        provinceid: instance.provinceid,
        districtid: instance.districtid,
        updateddate: now,
        updatedby: updatedBy,
        surveyNote: updateNote || formInstance.surveyNote
      });

      // Update or Insert Values
      if (values && values.length > 0) {
        for (const v of values) {
          if (v.id && v.id > 0) {
            // UPDATE existing
            await FormInstanceValue.update(
              {
                datasetmemberid: v.datasetmember?.id,
                dataelementid: v.datasetmember?.dataelementid,
                value: v.value,
                createddate: now,
                createdby: updatedBy
              },
              { where: { id: v.id } }
            );
          } else {
            // INSERT new
            await FormInstanceValue.create({
              forminstanceid: formInstance.id,
              datasetmemberid: v.datasetmember?.id,
              dataelementid: v.datasetmember?.dataelementid,
              value: v.value,
              createddate: now,
              createdby: updatedBy
            });
          }
        }
      }

      console.log(`✅ Updated FormInstance #${id} by ${updatedBy}`);
      return ResponseUtil.updated(res, formInstance, 'Cập nhật phiếu sàng lọc thành công');
      
    } catch (error: any) {
      console.error('❌ Update FormInstance error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
  
    // FIX: GET FormInstance with COMPLETE nested Orgunit data
    async getComplete(req: Request, res: Response) {
      try {
        const { id } = req.params;
        
        const formInstance = await FormInstance.findByPk(id, {
          include: [
            {
              model: Form,
              as: 'form'
            },
            {
              model: Period,
              as: 'period'
            },
            {
              // FIX: Load Orgunit với nested Parent (Huyện) và Parent.Parent (Tỉnh)
              model: OrgUnit,
              as: 'orgunit',
              include: [
                {
                  model: OrgUnit,
                  as: 'parent', // Huyện
                  include: [
                    {
                      model: OrgUnit,
                      as: 'parent' // Tỉnh
                    }
                  ]
                }
              ]
            },
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

    async getValues(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const { pageSize = 1000, page = 1 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);

        const values = await FormInstanceValue.findAll({
          where: { forminstanceid: id },
          limit: Number(pageSize),
          offset,
          include: [
            {
              model: DataElement,
              as: 'dataElement'
            }
          ]
        });

        return ResponseUtil.success(res, values);
      } catch (error: any) {
        console.error('Get FormInstance values error:', error);
        return ResponseUtil.error(res, error.message);
      }
    }
  }