import { SubscriberEntity } from '@novu/dal';
import { SubscribersService, UserSession } from '@novu/testing';
import { expect } from 'chai';

import { CreateTopicResponseDto } from '../dtos';

describe('Remove subscribers to topic - /topics/:topicId/subscribers/removal (POST)', async () => {
  const topicKey = 'topic-key-remove-subscribers';
  const topicName = 'topic-name';
  const URL = '/v1/topics';

  let session: UserSession;
  let subscriberService: SubscribersService;
  let subscriber: SubscriberEntity;
  let secondSubscriber: SubscriberEntity;
  let thirdSubscriber: SubscriberEntity;
  let topicId: string;
  let getTopicUrl: string;
  let removeSubscribersUrl: string;

  before(async () => {
    session = new UserSession();
    await session.initialize();

    subscriberService = new SubscribersService(session.organization._id, session.environment._id);
    subscriber = await subscriberService.createSubscriber();
    secondSubscriber = await subscriberService.createSubscriber();
    thirdSubscriber = await subscriberService.createSubscriber();

    const response = await session.testAgent.post(URL).send({
      key: topicKey,
      name: topicName,
    });
    expect(response.statusCode).to.eql(201);
    topicId = response.body.data._id;
    expect(topicId).to.exist;

    getTopicUrl = `${URL}/${topicId}`;
    const addSubscribersUrl = `${getTopicUrl}/subscribers`;
    removeSubscribersUrl = `${addSubscribersUrl}/removal`;

    // We prefill the data to work with
    await session.testAgent
      .post(addSubscribersUrl)
      .send({ subscribers: [subscriber._id, secondSubscriber._id, thirdSubscriber._id] });
  });

  it('should throw validation error for missing request payload information', async () => {
    const { body } = await session.testAgent.post(removeSubscribersUrl).send({});

    expect(body.statusCode).to.eql(400);
    expect(body.message).to.eql(['subscribers should not be null or undefined', 'subscribers must be an array']);
  });

  it('should remove subscriber from the topic', async () => {
    const subscribers = [subscriber._id];

    const response = await session.testAgent.post(removeSubscribersUrl).send({ subscribers });

    expect(response.statusCode).to.eql(204);
    expect(response.body).to.be.empty;

    const getResponse = await session.testAgent.get(getTopicUrl);
    expect(getResponse.statusCode).to.eql(200);

    const getResponseTopic = getResponse.body.data;

    expect(getResponseTopic._id).to.eql(topicId);
    expect(getResponseTopic._userId).to.eql(session.user._id);
    expect(getResponseTopic._environmentId).to.eql(session.environment._id);
    expect(getResponseTopic._organizationId).to.eql(session.organization._id);
    expect(getResponseTopic.key).to.eql(topicKey);
    expect(getResponseTopic.name).to.eql(topicName);
    expect(getResponseTopic.subscribers).to.eql([secondSubscriber._id, thirdSubscriber._id]);
  });

  it('should keep the same when trying to remove a subscriber already removed from the topic', async () => {
    const subscribers = [subscriber._id];

    const response = await session.testAgent.post(removeSubscribersUrl).send({ subscribers });

    expect(response.statusCode).to.eql(204);
    expect(response.body).to.be.empty;

    const getResponse = await session.testAgent.get(getTopicUrl);
    expect(getResponse.statusCode).to.eql(200);

    const getResponseTopic = getResponse.body.data;

    expect(getResponseTopic._id).to.eql(topicId);
    expect(getResponseTopic._userId).to.eql(session.user._id);
    expect(getResponseTopic._environmentId).to.eql(session.environment._id);
    expect(getResponseTopic._organizationId).to.eql(session.organization._id);
    expect(getResponseTopic.key).to.eql(topicKey);
    expect(getResponseTopic.name).to.eql(topicName);
    expect(getResponseTopic.subscribers).to.eql([secondSubscriber._id, thirdSubscriber._id]);
  });

  it('should remove multiple subscribers from the topic', async () => {
    const subscribers = [secondSubscriber._id, thirdSubscriber._id];

    const response = await session.testAgent.post(removeSubscribersUrl).send({ subscribers });

    expect(response.statusCode).to.eql(204);
    expect(response.body).to.be.empty;

    const getResponse = await session.testAgent.get(getTopicUrl);
    expect(getResponse.statusCode).to.eql(200);

    const getResponseTopic = getResponse.body.data;

    expect(getResponseTopic._id).to.eql(topicId);
    expect(getResponseTopic._userId).to.eql(session.user._id);
    expect(getResponseTopic._environmentId).to.eql(session.environment._id);
    expect(getResponseTopic._organizationId).to.eql(session.organization._id);
    expect(getResponseTopic.key).to.eql(topicKey);
    expect(getResponseTopic.name).to.eql(topicName);
    expect(getResponseTopic.subscribers).to.eql([]);
  });
});
