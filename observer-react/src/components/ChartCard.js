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
import { format } from 'util';



class ChartCard extends React.Component {
	
	constructor(props){
		super(props)
		this.data = props.data;
		this.max = props.max;
		this.title = props.title;
		this.datatype = props.datatype || null;
	}
	
	render(){
		let formattedData = [];
		if(this.data) {
			this.data.map((d,i) =>{
				// history data
				if(this.datatype != null) {
					let g = new Date(d.timestamp);
					
					formattedData.push({x: i, y: d.value})
				}
				else {
					formattedData.push({x: i, y: d.data})

				}
			});
		}
		else {
			formattedData = [{x: 0, y: 0}];
		}
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