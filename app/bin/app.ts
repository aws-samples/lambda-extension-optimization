#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaBlankExtensionStack } from '../lib/lambda-blank-ext-stack';
import { Constants } from '../core/constants';
import { LambdaEventCollectorExtensionStack } from '../lib/lambda-ec-ext-stack';
import { LambdaEventCollectorAotExtensionStack } from '../lib/lambda-ec-aot-ext-stack';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new cdk.App();
cdk.Aspects.of(app).add(new AwsSolutionsChecks({verbose: true}));

new LambdaBlankExtensionStack(app, Constants.Resources.Stacks.BlankExtensionsStack, {});
new LambdaEventCollectorExtensionStack(app, Constants.Resources.Stacks.EventCollectorExtensionStack, {});
new LambdaEventCollectorAotExtensionStack(app, Constants.Resources.Stacks.EventCollectorAotExtensionStack, {});