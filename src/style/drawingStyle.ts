export class DrawingStyle {
  lineColor: string = "black";
  lineThickness: number = 4;
  stateBg: string = "transparent";
  highlightColor: string = "teal";
  textStyle: string = "900 21px Lato";
  arrowHeadSize: number = 20;
  snap: number = 10;
  selectPadding: number = 10;
  r: number = 50;
}

export class DarkStyle extends DrawingStyle {
  constructor() {
    super();
    this.lineColor = "white";
    this.highlightColor = "red";
  }
}
