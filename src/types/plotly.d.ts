declare module 'react-plotly.js' {
  import { Component } from 'react';

  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: { data: Plotly.Data[]; layout: Partial<Plotly.Layout> }) => void;
    onUpdate?: (figure: { data: Plotly.Data[]; layout: Partial<Plotly.Layout> }) => void;
  }

  class Plot extends Component<PlotParams> {}
  export default Plot;
}

declare namespace Plotly {
  interface Data {
    x?: (number | string)[];
    y?: (number | string)[];
    type?: string;
    mode?: string;
    name?: string;
    line?: {
      color?: string;
      width?: number;
      dash?: string;
    };
    marker?: {
      color?: string | string[];
      colors?: string[];
    };
    labels?: string[];
    values?: number[];
    hole?: number;
    textinfo?: string;
    hoverinfo?: string;
    [key: string]: unknown;
  }

  interface Layout {
    title?: string | { text?: string; font?: { family?: string; size?: number } };
    font?: { family?: string; size?: number };
    paper_bgcolor?: string;
    plot_bgcolor?: string;
    autosize?: boolean;
    margin?: { l?: number; r?: number; t?: number; b?: number };
    xaxis?: { title?: string; gridcolor?: string; [key: string]: unknown };
    yaxis?: { title?: string; gridcolor?: string; [key: string]: unknown };
    barmode?: string;
    showlegend?: boolean;
    [key: string]: unknown;
  }

  interface Config {
    responsive?: boolean;
    displayModeBar?: boolean;
    displaylogo?: boolean;
    [key: string]: unknown;
  }
}
