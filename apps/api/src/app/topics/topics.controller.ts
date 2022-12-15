import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExcludeController,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IJwtPayload } from '@novu/shared';

import {
  AddSubscribersRequestDto,
  CreateTopicRequestDto,
  CreateTopicResponseDto,
  FilterTopicsRequestDto,
  FilterTopicsResponseDto,
  GetTopicResponseDto,
  RemoveSubscribersRequestDto,
  RenameTopicRequestDto,
  RenameTopicResponseDto,
} from './dtos';
import {
  AddSubscribersCommand,
  AddSubscribersUseCase,
  CreateTopicCommand,
  CreateTopicUseCase,
  FilterTopicsCommand,
  FilterTopicsUseCase,
  GetTopicCommand,
  GetTopicUseCase,
  RemoveSubscribersCommand,
  RemoveSubscribersUseCase,
  RenameTopicCommand,
  RenameTopicUseCase,
} from './use-cases';

import { JwtAuthGuard } from '../auth/framework/auth.guard';
import { ExternalApiAccessible } from '../auth/framework/external-api.decorator';
import { UserSession } from '../shared/framework/user.decorator';
import { AnalyticsService } from '../shared/services/analytics/analytics.service';
import { ANALYTICS_SERVICE } from '../shared/shared.module';

@Controller('topics')
@ApiTags('Topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(
    private addSubscribersUseCase: AddSubscribersUseCase,
    private createTopicUseCase: CreateTopicUseCase,
    private filterTopicsUseCase: FilterTopicsUseCase,
    private getTopicUseCase: GetTopicUseCase,
    private removeSubscribersUseCase: RemoveSubscribersUseCase,
    private renameTopicUseCase: RenameTopicUseCase,
    @Inject(ANALYTICS_SERVICE) private analyticsService: AnalyticsService
  ) {}

  @ExternalApiAccessible()
  @ApiCreatedResponse({
    type: CreateTopicResponseDto,
  })
  @Post('')
  async createTopic(
    @UserSession() user: IJwtPayload,
    @Body() body: CreateTopicRequestDto
  ): Promise<CreateTopicResponseDto> {
    const topic = await this.createTopicUseCase.execute(
      CreateTopicCommand.create({
        environmentId: user.environmentId,
        key: body.key,
        name: body.name,
        organizationId: user.organizationId,
        userId: user._id,
      })
    );

    return {
      _id: topic._id,
    };
  }

  @ExternalApiAccessible()
  @ApiNoContentResponse()
  @Post(':topicId/subscribers')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addSubscribers(
    @UserSession() user: IJwtPayload,
    @Param('topicId') topicId: string,
    @Body() body: AddSubscribersRequestDto
  ): Promise<void> {
    await this.addSubscribersUseCase.execute(
      AddSubscribersCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        subscribers: body.subscribers,
        topicId,
        userId: user._id,
      })
    );
  }

  @ExternalApiAccessible()
  @ApiNoContentResponse()
  @Post(':topicId/subscribers/removal')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSubscribers(
    @UserSession() user: IJwtPayload,
    @Param('topicId') topicId: string,
    @Body() body: RemoveSubscribersRequestDto
  ): Promise<void> {
    await this.removeSubscribersUseCase.execute(
      RemoveSubscribersCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        subscribers: body.subscribers,
        topicId,
        userId: user._id,
      })
    );
  }

  @ExternalApiAccessible()
  @ApiQuery({
    name: 'key',
    type: String,
    description: 'Topic key',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Number of page for the pagination',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: 'Size of page for the pagination',
    required: false,
  })
  @ApiOkResponse({
    type: FilterTopicsResponseDto,
  })
  @Get('')
  async filterTopics(
    @UserSession() user: IJwtPayload,
    @Query() query?: FilterTopicsRequestDto
  ): Promise<FilterTopicsResponseDto> {
    return await this.filterTopicsUseCase.execute(
      FilterTopicsCommand.create({
        environmentId: user.environmentId,
        key: query?.key,
        organizationId: user.organizationId,
        page: query?.page,
        pageSize: query?.pageSize,
        userId: user._id,
      })
    );
  }

  @ExternalApiAccessible()
  @ApiOkResponse({
    type: GetTopicResponseDto,
  })
  @Get(':topicId')
  async getTopic(@UserSession() user: IJwtPayload, @Param('topicId') topicId: string): Promise<GetTopicResponseDto> {
    return await this.getTopicUseCase.execute(
      GetTopicCommand.create({
        environmentId: user.environmentId,
        id: topicId,
        organizationId: user.organizationId,
        userId: user._id,
      })
    );
  }

  @ExternalApiAccessible()
  @ApiOkResponse({
    type: RenameTopicResponseDto,
  })
  @Patch(':topicId')
  async renameTopic(
    @UserSession() user: IJwtPayload,
    @Param('topicId') topicId: string,
    @Body() body: RenameTopicRequestDto
  ): Promise<RenameTopicResponseDto> {
    return await this.renameTopicUseCase.execute(
      RenameTopicCommand.create({
        environmentId: user.environmentId,
        id: topicId,
        name: body.name,
        organizationId: user.organizationId,
        userId: user._id,
      })
    );
  }
}
