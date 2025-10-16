import { FormMember } from '../models/FormMember';
import { BaseController } from './base.controller';

export class FormMemberController extends BaseController<FormMember> {
  constructor() {
    super(FormMember);
  }
}
