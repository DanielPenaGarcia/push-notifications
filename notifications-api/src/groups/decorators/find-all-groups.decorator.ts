import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parseLimit } from 'notification/utils/requests/parse-limit';
import { parsePage } from 'notification/utils/requests/parse-page';
import { parseSort } from 'notification/utils/requests/parse-sort';
import { FindAllGroupsQueryDTO } from '../input-dto/find-all-groups.dto';

const sortFields = ['createdAt', 'updatedAt'];

export const FindAllGroupsQuery = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const page: number = parsePage(req);
    const count: number = parseLimit(req);
    const sort: object = parseSort(req, sortFields);
    const query: FindAllGroupsQueryDTO = new FindAllGroupsQueryDTO(
      page,
      count,
      sort,
    );
    return query;
  },
);
