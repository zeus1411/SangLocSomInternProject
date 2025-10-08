import { DatasetMember } from '../models/DatasetMember';
import { BaseController } from './base.controller';

export class DatasetMemberController extends BaseController<DatasetMember> {
  constructor() {
    super(DatasetMember);
  }
}
