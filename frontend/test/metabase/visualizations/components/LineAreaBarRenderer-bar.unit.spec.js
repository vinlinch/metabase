import "__support__/mocks"; // included explicitly whereas with e2e tests it comes with __support__/e2e_tests

import {
  NumberColumn,
  StringColumn,
  dispatchUIEvent,
  renderLineAreaBar,
  createFixture,
  cleanupFixture,
} from "../__support__/visualizations";

const DEFAULT_SETTINGS = {
  "graph.x_axis.scale": "ordinal",
  "graph.y_axis.scale": "linear",
  "graph.x_axis.axis_enabled": true,
  "graph.y_axis.axis_enabled": true,
  "graph.colors": ["#00FF00", "#FF0000"],
  series: () => DEFAULT_SERIES_SETTINGS,
  column: () => DEFAULT_COLUMN_SETTINGS,
};

const DEFAULT_SERIES_SETTINGS = {
  display: "bar",
};

const DEFAULT_COLUMN_SETTINGS = {
  date_style: "MMMM D, YYYY",
};

function MainSeries(chartType, settings = {}, value = 1) {
  return {
    card: {
      display: chartType,
      visualization_settings: {
        ...DEFAULT_SETTINGS,
        ...settings,
      },
    },
    data: {
      cols: [
        StringColumn({ display_name: "Category", source: "breakout" }),
        NumberColumn({ display_name: "Sum", source: "aggregation" }),
      ],
      rows: [["A", value]],
    },
  };
}

function ExtraSeries() {
  return {
    card: {},
    data: {
      cols: [
        StringColumn({ display_name: "Category", source: "breakout" }),
        NumberColumn({ display_name: "Count", source: "aggregation" }),
      ],
      rows: [["A", 2]],
    },
  };
}

describe("LineAreaBarRenderer-bar", () => {
  let element;
  const qsa = selector => [...element.querySelectorAll(selector)];

  beforeEach(function() {
    element = createFixture();
  });

  afterEach(function() {
    cleanupFixture(element);
  });

  it(`should render an bar chart with 1 series`, () => {
    const onHoverChange = jest.fn();
    renderLineAreaBar(element, [MainSeries("bar")], {
      onHoverChange,
    });

    // hover over each bar
    dispatchUIEvent(qsa(".bar, .dot")[0], "mousemove");

    const { calls } = onHoverChange.mock;
    expect(getDataKeyValues(calls[0][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "Sum", value: 1 },
    ]);
  });

  it(`should render an bar chart with 2 series`, () => {
    const onHoverChange = jest.fn();
    renderLineAreaBar(element, [MainSeries("bar"), ExtraSeries()], {
      onHoverChange,
    });

    // hover over each bar
    dispatchUIEvent(qsa(".bar, .dot")[0], "mousemove");
    dispatchUIEvent(qsa(".bar, .dot")[1], "mousemove");

    const { calls } = onHoverChange.mock;
    expect(getDataKeyValues(calls[0][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "Sum", value: 1 },
    ]);
    expect(getDataKeyValues(calls[1][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "Count", value: 2 },
    ]);
  });

  it(`should render an bar stacked chart with 2 series`, () => {
    const onHoverChange = jest.fn();
    renderLineAreaBar(
      element,
      [MainSeries("bar", { "stackable.stack_type": "stacked" }), ExtraSeries()],
      {
        onHoverChange,
      },
    );

    // hover over each bar
    dispatchUIEvent(qsa(".bar, .dot")[0], "mousemove");
    dispatchUIEvent(qsa(".bar, .dot")[1], "mousemove");

    const { calls } = onHoverChange.mock;
    expect(getDataKeyValues(calls[0][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "Sum", value: 1 },
    ]);
    expect(getDataKeyValues(calls[1][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "Count", value: 2 },
    ]);
  });

  it(`should render an bar normalized chart with 2 series`, () => {
    const onHoverChange = jest.fn();
    renderLineAreaBar(
      element,
      [
        MainSeries("bar", { "stackable.stack_type": "normalized" }),
        ExtraSeries(),
      ],
      { onHoverChange },
    );

    // hover over each bar
    dispatchUIEvent(qsa(".bar, .dot")[0], "mousemove");
    dispatchUIEvent(qsa(".bar, .dot")[1], "mousemove");

    const { calls } = onHoverChange.mock;
    expect(getDataKeyValues(calls[0][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "% Sum", value: "33%" },
    ]);
    expect(getDataKeyValues(calls[1][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "% Count", value: "67%" },
    ]);
  });

  it(`should render an bar normalized chart with just one series`, () => {
    const onHoverChange = jest.fn();
    renderLineAreaBar(
      element,
      [MainSeries("bar", { "stackable.stack_type": "normalized" }, 3)],
      { onHoverChange },
    );

    dispatchUIEvent(qsa(".bar, .dot")[0], "mousemove");

    const { calls } = onHoverChange.mock;
    expect(getDataKeyValues(calls[0][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "% Sum", value: "100%" },
    ]);
  });

  it("should replace the aggregation name with the series name", () => {
    const onHoverChange = jest.fn();
    renderLineAreaBar(
      element,
      [
        MainSeries("bar", {
          series: () => ({ ...DEFAULT_SERIES_SETTINGS, title: "Foo" }),
        }),
      ],
      { onHoverChange },
    );

    // hover over each bar
    dispatchUIEvent(qsa(".bar, .dot")[0], "mousemove");

    const { calls } = onHoverChange.mock;
    expect(getDataKeyValues(calls[0][0])).toEqual([
      { key: "Category", value: "A" },
      { key: "Foo", value: 1 },
    ]);
  });
});

function getDataKeyValues(hover) {
  return hover.data.map(({ key, value }) => ({ key, value }));
}
