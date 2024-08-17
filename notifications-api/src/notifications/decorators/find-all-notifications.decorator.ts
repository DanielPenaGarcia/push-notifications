import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parseLimit } from 'notification/utils/requests/parse-limit';
import { parsePage } from 'notification/utils/requests/parse-page';
import { parseSort } from 'notification/utils/requests/parse-sort';
import { FindAllNotificationsQueryDTO } from '../input-dto/find-all-notifications.dto';

const sortFields = ['createdAt', 'updatedAt'];

export const FindAllNotificationsQuery = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const page: number = parsePage(req);
    const count: number = parseLimit(req);
    const sort: object = parseSort(req, sortFields);
    const query: FindAllNotificationsQueryDTO = new FindAllNotificationsQueryDTO(
      page,
      count,
      sort,
    );
    return query;
  },
);
