import React from 'react'
import {
	XYPlot,
	XAxis,
	YAxis,
	HorizontalGridLines,
	VerticalGridLines,
	LineSeries,
	DecorativeAxis
  } from 'react-vis';



class ChartCard extends React.Component {
	
	constructor(props){
		super(props)
		this.data = props.data;
		this.max = props.max;
		this.title = props.title;
	}
	
	render(){
		let formattedData = [];
		this.data.map((d,i) =>{
			formattedData.push({x: i, y: d.data})
		})
		return(<div>
			<XYPlot width={400} height={300}>
			<HorizontalGridLines />
			<VerticalGridLines />
			<XAxis position="start" />
			<YAxis title={this.title}/>
			<LineSeries
			  data={formattedData}
			  stroke="red" opacity="0"
			/>
			<LineSeries className="top-series"
			  data={[{y: this.max, x: formattedData[0].x},{y: this.max, x:formattedData[formattedData.length -1].x}]}
			/>
			<LineSeries className="bottom-series"
			  data={[{y: 0, x:formattedData[0].x}, {y:0, x:formattedData[formattedData.length -1].x}]}
			/>
			</XYPlot>
			 </div>
		)
	}
}

export default ChartCard;