import { DataElement } from '../models/DataElement';
import { BaseController } from './base.controller';

export class DataElementController extends BaseController<DataElement> {
  constructor() {
    super(DataElement);
  }
}
