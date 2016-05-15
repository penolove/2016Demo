//note that tooltip should be but in body, each time replot remove its' tooltip id:"tooltip"+selector///



// ----------------------major plot-------------------


	function trend_plot_on(trend_chart_setting,plot_setting,selector){
		var csv_file=trend_chart_setting["filename"]
		var timeformat=trend_chart_setting["timeformat"]
		var parseDate = d3.time.format(timeformat).parse;
		var format = d3.time.format(timeformat);
		function type(d) {
			//used to parse date
			d.temp =d.date.toString();
			//using parseDate function
			d.date = parseDate(d.date.toString());
			return d;
		}
		csv(csv_file,type,function(error, data){
				//select the container

				var svgC_width=parseInt(d3.select("#"+selector).style("width"))
				var svgC_height=parseInt(d3.select("#"+selector).style("height"))
				var svgContainer = d3.select("#"+selector).append("svg").attr("width", +svgC_width).attr("height", +svgC_height);
				//get extent from data
				var dataD=data.map(function(d) {;return d.date; })
				var dataY=data.map(function(d) { return +d.y; })
				var x_extent=d3.extent(dataD)
				var y_extent=d3.extent(dataY)
				//extend the extnet
				y_extent=exten4range(y_extent,0.05)
				//tooltip for trend chart
				var tooltip = d3.select("body")
								.append("div")
								.attr("id","tooltip"+selector)
								.attr("class", "tooltip")
								.style("opacity", 0);
				//x,y axis scale 
				var x_axisscale=d3.time.scale().domain(x_extent);
				var y_axisscale=d3.scale.linear().domain(exchange_extent(y_extent));
				
				///create x,y axis///
				//y axis were value axis
				y_axisscale=drawaxis(svgContainer,"left",y_axisscale,selector,plot_setting);
				//x axis were time axis
				x_axisscale=drawaxis(svgContainer,"bottom",x_axisscale,selector,plot_setting);
				///create clip-path///
				addclip(svgContainer,plot_setting,selector);
				//drawtrend
				drawtrend(svgContainer,x_axisscale,y_axisscale,data,"cutme",selector,plot_setting);


				
				///create x,y brush///
				//things should be change using below look like

				x_target_setting={"target":["x1","x2"],"oritarget":["orix1","orix2"]}
				x_callbrush(svgContainer,x_axisscale,"bottom",selector,plot_setting,x_target_setting);
				y_target_setting={"target":["y1","y2"],"oritarget":["oriy1","oriy2"]}
				y_callbrush(svgContainer,y_axisscale,"left",selector,plot_setting,y_target_setting);
				
				///plot guideline on & detect line///
				addguideline(svgContainer,selector,tooltip,plot_setting,x_axisscale,dataD,dataY,format);
				
			});
	}

	function scatter_plot_on(csv_file,plot_setting,selector){
		//used to draw scatter_plot , template
		//First : read file
		d3.csv(csv_file,function(error, data){
				//select the container
				var svgC_width=parseInt(d3.select("#"+selector).style("width"))
				var svgC_height=parseInt(d3.select("#"+selector).style("height"))
				var svgContainer = d3.select("#"+selector).append("svg").attr("width", svgC_width).attr("height", svgC_height);
				//get extent from data
				var x_extent=d3.extent(data.map(function(d) { return +d.x; }))
				var y_extent=d3.extent(data.map(function(d) { return +d.y; }))
				//extend the extnet
				x_extent=exten4range(x_extent,0.05)
				y_extent=exten4range(y_extent,0.05)
				//x,y axis scale 
				var x_axisscale=d3.scale.linear().domain(x_extent);
				var y_axisscale=d3.scale.linear().domain(exchange_extent(y_extent));
				//tooltip for showing dot information
				var tooltip = d3.select("body").append("div")
								.attr("id","tooltip"+selector)
								.attr("class", "tooltip")
								.style("opacity", 0);
				///create x,y axis///
				y_axisscale=drawaxis(svgContainer,"left",y_axisscale,selector,plot_setting);
				x_axisscale=drawaxis(svgContainer,"bottom",x_axisscale,selector,plot_setting);
				///create clip-path///
				addclip(svgContainer,plot_setting,selector);
				///create x,y axis brush target is value of dom object to move, origin records
				/// original data.
				x_target_setting={"target":["cx"],"oritarget":["dx"]};
				x_callbrush(svgContainer,x_axisscale,"bottom",selector,plot_setting,x_target_setting);
				y_target_setting={"target":["cy"],"oritarget":["dy"]};
				y_callbrush(svgContainer,y_axisscale,"left",selector,plot_setting,y_target_setting);
				///plot dots on///
				drawdots(svgContainer,x_axisscale,y_axisscale,data,"cutme",tooltip,selector,plot_setting);
	
		});
	}
	
	
	function empty_plot_on(plot_setting,selector){
		//a empty structure:
	 	var svgC_width=parseInt(d3.select("#"+selector).style("width"))
		var svgC_height=parseInt(d3.select("#"+selector).style("height"))
		var svgContainer = d3.select("#"+selector).append("svg").attr("width", svgC_width).attr("height", svgC_height);

		//scale
		var x_extent=[1,100];
		var y_extent=[1,100];
		var x_axisscale=d3.scale.linear().domain(x_extent);
		var y_axisscale=d3.scale.linear().domain(exchange_extent(y_extent));


		//tooltip for showing dot information
		var tooltip = d3.select("body").append("div")
						.attr("id","tooltip"+selector)
						.attr("class", "tooltip")
						.style("opacity", 0);
		///create x,y axis///
		y_axisscale=drawaxis(svgContainer,"left",y_axisscale,selector,plot_setting);
		x_axisscale=drawaxis(svgContainer,"bottom",x_axisscale,selector,plot_setting);
		///create clip-path///
		addclip(svgContainer,plot_setting,selector);
		///create x,y axis///

		//create brush but nothing to update
		x_target_setting={"target":[],"oritarget":[]};
		x_callbrush(svgContainer,x_axisscale,"bottom",selector,plot_setting,x_target_setting);
		y_target_setting={"target":[],"oritarget":[]};
		y_callbrush(svgContainer,y_axisscale,"left",selector,plot_setting,y_target_setting);
	}


	function stream_trend_plot_on(plot_setting,selector,y_axisscale,x_axisscale,count){
		//just like empty plot 
		//using a websocket to consturct streaming
		//make this global that all draws in same scale(WrapperWs need to modify,too.)
		var time_interval=[];
		var dataY=[];
		//
	 	var svgC_width=parseInt(d3.select("#"+selector).style("width"))
		var svgC_height=parseInt(d3.select("#"+selector).style("height"))
		var svgContainer = d3.select("#"+selector)
							.append("svg")
							.attr("width", svgC_width)
							.attr("height", svgC_height)
							.attr("id","svg"+selector);

		addclip(svgContainer,plot_setting,selector);
		var first=0;
		if(count<=3){
			if(count%3!=0)
				selector="axis_Throughput";
			else
				selector="axis_Latency";
		}else{
			if(count%3!=0)
				selector="axis_Throughput";
			else
				selector="axis_Latency";
		}
		drawaxis(svgContainer,"left",y_axisscale,selector,plot_setting);

		selector="axis_timestamp"
		drawaxis(svgContainer,"bottom",x_axisscale,selector,plot_setting);
		
		svgContainer.append('path')
		            .attr('class',"rd"+count+"_path ")
		            .attr("clip-path","url(#cliprd"+count+")")
		            .attr({
		              'y': 0,
		              'stroke': color("rd"+count),
		              'stroke-width': '3px',
		              'fill': 'none',
		              'opacity':0.95
		            });

		

		//return connection;
	}