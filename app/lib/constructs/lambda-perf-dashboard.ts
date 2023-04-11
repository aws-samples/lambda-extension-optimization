import { Duration, Stack } from "aws-cdk-lib";
import { Dashboard, LogQueryVisualizationType, LogQueryWidget, Metric, PeriodOverride, SingleValueWidget, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { QueryHelper } from "../utils/query-helper";

import { ILambdaAdapter } from './lambda-adapter'

interface DashboardProps {
  lambdas: ILambdaAdapter[];
}

export class LambdaPerfDashboard extends Construct {

  constructor(scope: Construct, id: string, props: DashboardProps) {
    super(scope, id);

    const dashboard = new Dashboard(this, "lambda-performance-dashboard", {
      dashboardName: "lambda-performance-dashboard",
      end: "end",
      periodOverride: PeriodOverride.INHERIT,
      start: "start",
    });

    const simpleWidgets = this.getMetrics().flatMap(m => {
      return props.lambdas.map(l => {
        return new SingleValueWidget({
          metrics: [
            m.with({
              period: Duration.minutes(30),
              statistic: "avg",
              unit: Unit.MILLISECONDS,
              dimensionsMap: {
                FunctionName: l.lambda.functionName
              }
            }),
            m.with({
              period: Duration.minutes(30),
              statistic: "max",
              unit: Unit.MILLISECONDS,
              dimensionsMap: {
                FunctionName: l.lambda.functionName
              }
            })
          ],
          width: 8,
          height: 4,
          sparkline: false,
          title: l.friendlyName,
          fullPrecision: false,
        });
      });
    });

    const memoryQuery = this.memoryQuery(props.lambdas);

    const memoryWidget =
      new LogQueryWidget({
        logGroupNames: props.lambdas.map(l => l.logGroup.logGroupName),
        view: LogQueryVisualizationType.BAR,
        queryString: memoryQuery,
        title: 'Memory Used',
        width: 8,
        height: 6
      });

    const coldStartDurationQuery = this.coldStartsDurationQuery(props.lambdas);

    const coldStartsDurationWidget =
      new LogQueryWidget({
        logGroupNames: props.lambdas.map(l => l.logGroup.logGroupName),
        view: LogQueryVisualizationType.BAR,
        queryString: coldStartDurationQuery,
        title: 'Cold Start Duration',
        width: 8,
        height: 6
      });

      const coldStartsQuery = this.coldStartsQuery(props.lambdas);

      const coldStartsWidget =
        new LogQueryWidget({
          logGroupNames: props.lambdas.map(l => l.logGroup.logGroupName),
          view: LogQueryVisualizationType.BAR,
          queryString: coldStartsQuery,
          title: 'Cold Starts',
          width: 8, // max
          height: 6
        });

    dashboard.addWidgets(...simpleWidgets, memoryWidget, coldStartsDurationWidget, coldStartsWidget);
  }

  private coldStartsQuery = (lambdas: ILambdaAdapter[]): string => {

    const fieldSelector = QueryHelper.replaceFieldValuesWithFriendlyNames(Stack.of(this).account, lambdas);

    return `filter @type = “REPORT”
      | fields 
      ${fieldSelector.fieldSelector}
      | stats 
       count(@initDuration) as ColdStarts,
       count(@type) as Invocations
      by ${fieldSelector.fieldName} as Function`
  }

  private coldStartsDurationQuery = (lambdas: ILambdaAdapter[]): string => {

    const fieldSelector = QueryHelper.replaceFieldValuesWithFriendlyNames(Stack.of(this).account, lambdas);

    return `filter @type = “REPORT”
      | fields 
      ${fieldSelector.fieldSelector}
      | stats 
       avg(@initDuration) as AvgColdStartDuration,
       max(@initDuration) as MaxColdStartDuration
      by ${fieldSelector.fieldName} as Function`
  }

  private memoryQuery = (lambdas: ILambdaAdapter[]): string => {

    const fieldSelector = QueryHelper.replaceFieldValuesWithFriendlyNames(Stack.of(this).account, lambdas);

    return `filter @type = “REPORT”
      | fields 
      ${fieldSelector.fieldSelector}
      | stats 
      avg(@maxMemoryUsed) as AvgMemoryUsed,
      max(@memorySize) as MemoryAllocated
      by ${fieldSelector.fieldName} as Function`
  }

  getMetrics = (): Metric[] => {
    return [
      new Metric({
        namespace: "AWS/Lambda",
        metricName: "Duration",
      }),
      new Metric({
        namespace: "AWS/Lambda",
        metricName: "PostRuntimeExtensionsDuration",
      })
    ]
  };
}