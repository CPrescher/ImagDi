import * as d3 from 'd3';


export class PreventContext {
  element: any;

  preventContextMenu() {
    this.element.on("contextmenu", ()=>{
      d3.event.preventDefault;
    })
  }
}

export class SVG extends PreventContext{
  element: any;

  constructor(
    public selector: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number) {
    super();
    this.element = d3.select(selector)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + x + "," + y + ")");
  }
}


export class Group extends PreventContext{
  element: any;

  constructor(
    public parent: any,
    public x: number,
    public y: number,
    public width: number,
    public height: number) {
    super();
    this.element = parent
      .append("g")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + x + "," + y + ")");
  }
}

