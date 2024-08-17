import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parseLimit } from 'notification/utils/requests/parse-limit';
import { parsePage } from 'notification/utils/requests/parse-page';
import { parseSort } from 'notification/utils/requests/parse-sort';
import { FindAllTasksQueryDTO } from '../input-dto/find-all-tasks.query';

const sortFields = ['createdAt', 'updatedAt'];

export const FindAllTasksQuery = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const page: number = parsePage(req);
    const count: number = parseLimit(req);
    const sort: object = parseSort(req, sortFields);
    const query: FindAllTasksQueryDTO = new FindAllTasksQueryDTO(
      page,
      count,
      sort,
    );
    return query;
  },
);
