import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parseLimit } from 'notification/utils/requests/parse-limit';
import { parsePage } from 'notification/utils/requests/parse-page';
import { parseSort } from 'notification/utils/requests/parse-sort';
import { FindAllTasksByGroupQueryDTO } from '../input-dto/find-all-task-by-group-id.dto';

const sortFields = ['createdAt', 'updatedAt'];

export const FindAllTasksByGroupQuery = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const page: number = parsePage(req);
    const count: number = parseLimit(req);
    const sort: object = parseSort(req, sortFields);
    const query: FindAllTasksByGroupQueryDTO = new FindAllTasksByGroupQueryDTO(
      page,
      count,
      sort,
    );
    return query;
  },
);
