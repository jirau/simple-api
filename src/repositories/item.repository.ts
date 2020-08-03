import {DefaultCrudRepository} from '@loopback/repository';
import {Item, ItemRelations} from '../models';
import {CloudantDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ItemRepository extends DefaultCrudRepository<
  Item,
  typeof Item.prototype._id,
  ItemRelations
> {
  constructor(
    @inject('datasources.cloudant') dataSource: CloudantDataSource,
  ) {
    super(Item, dataSource);
  }
}
