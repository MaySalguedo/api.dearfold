import { SetMetadata } from '@nestjs/common';

import { Guard } from '@repo-types/guard.type';

export const USE_GUARDS_KEY = 'useGuards';
export const UseGuards = (...guards: Array<Guard>) => SetMetadata(USE_GUARDS_KEY, guards);