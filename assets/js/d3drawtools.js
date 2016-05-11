// ----------------------plot tools-------------------	
	
	function addguideline(svgContainer,selector,tooltip,plot_setting,x_axisscale,dataD,dataY,format){
		//note that things will be clip before translate e.g. dot cx cy 
		//now used in : [trend_plot_on]
		var container_height=svgContainer.attr("height");
		var container_width=svgContainer.attr("width");
		var ywidth_ratio=plot_setting["ywidth_ratio"];
		var xwidth_ratio=plot_setting["xwidth_ratio"];
		var setoff_height=plot_setting["setoff_height"];
		var setoff_width=plot_setting["setoff_width"];
		
		if(container_width*(1-xwidth_ratio)/2>setoff_width){
				setoff_width=container_width*(1-xwidth_ratio)/2;
		}
		if(container_height*(1-ywidth_ratio)/2>setoff_height){
				setoff_height=container_height*(1-ywidth_ratio)/2;
		}
		var width_clip=container_width-setoff_width-container_width*(1-xwidth_ratio)/2;
		var height_clip=container_height*ywidth_ratio-setoff_height;
		//guideline
		svgContainer.append('line')
					.attr('y1',height_clip)
					.attr('y2',0)
					.attr('class','Imguide'+selector)
					.attr("transform", "translate("+setoff_width+","+setoff_height+")")
					.style('stroke', function(){return color20("guideline")})
					.attr('stroke-width',2)
					.attr('opacity',0);
		//guiderect	
		svgContainer.append("rect")
					.attr("width", width_clip)
					.attr("height", height_clip)
					.attr("transform", "translate("+setoff_width+","+setoff_height+")")
					.attr("opacity",0)
					.on("mouseover", function() { d3.selectAll(".Imguide"+selector).style("display", null); })
					.on("mouseout", function() {  d3.selectAll(".Imguide"+selector).style("display", "none");
												  tooltip.transition()		
														 .duration(250)		
														 .style("opacity", 0);	
												})
					.on('mousemove', function () {
										var x0 = x_axisscale.invert(d3.mouse(this)[0]);  
										i = bisectDate(dataD, x0, 1)-1;
										d = dataD[i];
										d3.selectAll(".Imguide"+selector)
											.transition()
											.duration(30)
											.attr('x1',x_axisscale(d))
											.attr('x2',x_axisscale(d))
											.attr('opacity',1);
										tooltip.transition()		
											   .duration(200)		
											   .style("opacity", .9);		
										tooltip.html("Y :"+parseFloat(dataY[i]).toFixed(3) + "<br/>"  + "Date :"+format(d))
											.style("left", (d3.event.pageX) + "px")		
											.style("top", (d3.event.pageY - 28) + "px");
											
									});
	}
	
	function getTextWidth(text, font) {
		// re-use canvas object for better performance
		var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
		var context = canvas.getContext("2d");
		context.font = font;
		var metrics = context.measureText(text);
		return metrics.width;
	};
	
	function exten4range(x_extent,percentage){
		//entend the entent
		//used in [scatter_plot_on,trend_plot_on]
		var range=(x_extent[1]-x_extent[0]);
		x_extent[1]=range*percentage/2+x_extent[1]
		x_extent[0]=x_extent[0]-range*percentage/2
		return x_extent
	}

	function drawaxis(svgContainer,direction,axisscale,selector,plot_setting) {

		///////////////////////////////////////////////////////////////////
		///arg:															///
		/// svgContainer : select the svg you wnat to append axis  		///
		/// direction: axis direction bottom , left 					///
		/// axisscale: call d3.scale linear with domain(data range)	 ///
		/// plot_setting :ywidth_ratio,xwidth_ratio,setoff_height,setoff_width
		/// selector : container ID									 	///
		///////////////////////////////////////////////////L.R 2016/1/10///
		//used in [scatter_plot_on,trend_plot_on,empty_plot_on,stream_trend_plot_on]
		var container_height=svgContainer.attr("height");
		var container_width=svgContainer.attr("width");
		var ywidth_ratio=plot_setting["ywidth_ratio"];
		var xwidth_ratio=plot_setting["xwidth_ratio"];
		var setoff_height=plot_setting["setoff_height"];
		var setoff_width=plot_setting["setoff_width"];

		if(container_width*(1-xwidth_ratio)/2>setoff_width){
				var setoff_width=container_width*(1-xwidth_ratio)/2;
		}
		if(container_height*(1-ywidth_ratio)/2>setoff_height){
					var setoff_height=container_height*(1-ywidth_ratio)/2;
		}
		
		var width_rect=container_width-setoff_width-container_width*(1-xwidth_ratio)/2;
		var height_rect=container_height*ywidth_ratio;
		
		if(direction=="bottom"){
			////bottom axis adjustment////
			axisscale.range([0, width_rect]);
			//bottom cut
			if(container_height*(1-ywidth_ratio)>=20){
				container_height=height_rect;
			}else{
				container_height=container_height-20;
			}
		}else if (direction=="left"){
			////left axis adjustment////
			axisscale.range([0, height_rect-setoff_height]);
			///left axis should adjust 30px
			//avoid upper word were cuted
			container_height=setoff_height;
		}
		//left adjust


		xrAxis = d3.svg.axis().scale(axisscale).orient(direction).ticks(7);

		var xAxisGroup = svgContainer.append("g") //於svg上畫出
									 .attr("class", "axis "+selector+direction)
									 .attr("transform", "translate("+setoff_width+"," +container_height+ ")")
									 .call(xrAxis);
		return axisscale
	}
	
	function x_callbrush(svgContainer,x_axisscale,direction,selector,plot_setting,target_setting){
			// used to create brush object
			// lots of risk
			// transtion variable :brush_width container_width height_clip
			//used in [scatter_plot_on,trend_plot_on,empty_plot_on]
			var container_height=svgContainer.attr("height");
			var container_width=svgContainer.attr("width");
			var ywidth_ratio=plot_setting["ywidth_ratio"];
			var xwidth_ratio=plot_setting["xwidth_ratio"];
			var setoff_height=plot_setting["setoff_height"];
			var setoff_width=plot_setting["setoff_width"];
			if(container_width*(1-xwidth_ratio)/2>setoff_width){
					var setoff_width=container_width*(1-xwidth_ratio)/2;
			}
			if(container_height*(1-ywidth_ratio)/2>setoff_height){
					var setoff_height=container_height*(1-ywidth_ratio)/2;
			}
			var width_clip=container_width-setoff_width-container_width*(1-xwidth_ratio)/2;
			var height_clip=container_height*ywidth_ratio;
			// adjust for brush rect
			var brush_width=setoff_width-20;
			var origextent=x_axisscale.domain();
			x_axisscale.domain(origextent)
			// the moving rect on plot
			var brushrect=svgContainer.append("rect")
									  .attr("class","x-brushrect")
									  .attr("height",height_clip)
									  .attr("width",0)
									  .attr("transform", "translate("+setoff_width+",0)")
									  .style("opacity", 0.3);
			var brush = d3.svg.brush()
					  .x(x_axisscale)
					  .on("brush", brushmove)
					  .on("brushend", brushend);
					  
			var target=target_setting["target"];
			var oritarget=target_setting["oritarget"];
			var setoff_temp=setoff_width;
			
			svgContainer.append("rect")
						.attr("transform", "translate("+setoff_width+","+height_clip+")")
						.attr("class", "brush "+selector+direction+"")
						.attr("width", x_axisscale.range()[1])
						.attr("height", 20).attr("rx", 5).attr("ry", 5)
						.attr("opacity",0.20).attr("fill","blue");
						
			svgContainer.append("g")
						.attr("class", "brush "+selector+direction)
						.call(brush)
						.attr("transform", "translate("+setoff_width+","+height_clip+")")
						.selectAll("rect").attr("height", 20).attr("rx", 5).attr("ry", 5)
						.attr("opacity",0.72).attr("fill","blue");


			function brushmove() {
				brushrect.attr("width",x_axisscale(brush.extent()[1])-x_axisscale(brush.extent()[0]))
						 .attr("x",x_axisscale(brush.extent()[0]))
				var extent = brush.extent();  
			}
			
			function brushend() {
				var tempdo=brush.empty() ? origextent : brush.extent();
				x_axisscale.domain(tempdo);
				for (i = 0; i < target.length; i++) { 
					d3.selectAll("."+selector).each(function(){return d3.select(this).attr(target[i],x_axisscale(d3.select(this).attr(oritarget[i]))+setoff_temp) ;})
				}
				d3.selectAll("."+selector+direction).remove();
				brush.clear();
				
				//draw axis first,let brush on the top
				drawaxis(svgContainer,direction,x_axisscale,selector,plot_setting);
				// reappend the background
				svgContainer.append("rect")
							.attr("transform", "translate("+setoff_width+","+height_clip+")")
							.attr("class", "brush "+selector+direction+"")
							.attr("width", x_axisscale.range()[1])
							.attr("height", 20).attr("rx", 5).attr("ry", 5)
							.attr("opacity",0.20).attr("fill","blue");
				// recall the brush using new x_axisscale
				svgContainer.append("g")
							.call(brush)
							.attr("class", "brush "+selector+direction+"")
							.attr("transform", "translate("+setoff_width+","+height_clip+")")
							.selectAll("rect").attr("height", 20).attr("rx", 5).attr("ry", 5)
							.attr("opacity",0.72).attr("fill","blue");
				// reset the brushrect
				brushrect.attr("width",0)
				
				
			}
	}

	function y_callbrush(svgContainer,x_axisscale,direction,selector,plot_setting,target_setting){
			// used to create brush object
			// lots of risk
			// transtion variable :brush_width container_width height_clip
			//used in [scatter_plot_on,trend_plot_on,empty_plot_on]
			var container_height=svgContainer.attr("height");
			var container_width=svgContainer.attr("width");
			
			var ywidth_ratio=plot_setting["ywidth_ratio"];
			var xwidth_ratio=plot_setting["xwidth_ratio"];
			var setoff_height=plot_setting["setoff_height"];
			var setoff_width=plot_setting["setoff_width"];
			
			if(container_width*(1-xwidth_ratio)/2>setoff_width){
					var setoff_width=container_width*(1-xwidth_ratio)/2;
			}
			if(container_height*(1-ywidth_ratio)/2>setoff_height){
					var setoff_height=container_height*(1-ywidth_ratio)/2;
			}
			var width_clip=container_width-setoff_width-container_width*(1-xwidth_ratio)/2;
			var height_clip=container_height*ywidth_ratio;
			// adjust for brush rect
			var brush_width=setoff_width-20;
			var origextent=x_axisscale.domain();

			
			// the moving rect on plot
			var brushrect=svgContainer.append("rect")
									  .attr("class","y-brushrect")
									  .attr("width",width_clip)
									  .attr("height",0)
									  .attr("transform", "translate("+setoff_width+","+setoff_height+")")
									  .style("opacity", 0.3);
			var brush = d3.svg.brush()
						  .y(x_axisscale)
						  .on("brush", brushmove)
						  .on("brushend", brushend);
			var target=target_setting["target"];
			var oritarget=target_setting["oritarget"];
			var setoff_temp=setoff_height;
			svgContainer.append("rect")
							.attr("transform", "translate("+brush_width+","+setoff_height+")")
							.attr("class", "brush "+selector+direction)
							.attr("height", x_axisscale.range()[1])
							.attr("width", 20).attr("rx", 5).attr("ry", 5)
							.attr("opacity",0.20).attr("fill","blue")
			svgContainer.append("g")
						.attr("class", "brush "+selector+direction)
						.call(brush)
						.attr("transform", "translate("+brush_width+","+setoff_height+")")
						.selectAll("rect").attr("id","oppo").attr("width", 20).attr("rx", 5).attr("ry", 5)
						.attr("opacity",0.72).attr("fill","blue");
			


			function brushmove() {
				brushrect.attr("height",Math.abs(x_axisscale(brush.extent()[1])-x_axisscale(brush.extent()[0])))
						 .attr("y",x_axisscale(brush.extent()[1]))
				var extent = brush.extent();  
			}
			
			function brushend() {

				// cause of reverse axis
				var tempdo=brush.empty() ? origextent : exchange_extent(brush.extent());

				x_axisscale.domain(tempdo);
				for (i = 0; i < target.length; i++) {
					d3.selectAll("."+selector).each(function(){ return d3.select(this).attr(target[i],x_axisscale(d3.select(this).attr(oritarget[i]))+setoff_temp) ;})
				}
				d3.selectAll("."+selector+direction).remove();
				brush.clear();
				
				// draw axis first,let brush on the top
				drawaxis(svgContainer,direction,x_axisscale,selector,plot_setting);

				// reappend the background
				svgContainer.append("rect")
							.attr("transform", "translate("+brush_width+","+setoff_height+")")
							.attr("class", "brush "+selector+direction)
							.attr("height", x_axisscale.range()[1])
							.attr("width", 20).attr("rx", 5).attr("ry", 5)
							.attr("opacity",0.20).attr("fill","blue");
				// recall the brush using new x_axisscale
				svgContainer.append("g")
					.attr("class", "brush "+selector+direction)
					.call(brush)
					.attr("transform", "translate("+brush_width+","+setoff_height+")")
					.selectAll("rect").attr("width", 20).attr("rx", 5).attr("ry", 5)
					.attr("opacity",0.72).attr("fill","blue");
				// reset the brushrect 
				brushrect.attr("height",0);

			}
	}

	function drawtrend(svgContainer,x_axisscale,y_axisscale,data,clas,selector,plot_setting) {
		//used in [trend_plot_on]
		var container_height=svgContainer.attr("height")
		var container_width=svgContainer.attr("width")
		//for left adjust
		var ywidth_ratio=plot_setting["ywidth_ratio"];
		var xwidth_ratio=plot_setting["xwidth_ratio"];
		var setoff_height=plot_setting["setoff_height"];
		var setoff_width=plot_setting["setoff_width"];
		//adjust for y-axis
		if(container_width*(1-xwidth_ratio)/2>setoff_width){
				var setoff_width=container_width*(1-xwidth_ratio)/2;
		}
		if(container_height*(1-ywidth_ratio)/2>setoff_height){
				var setoff_height=container_height*(1-ywidth_ratio)/2;
		}
		var prex;
		var prey;
		var tempx;
		var tempy;
		var predate;
		var tempdate;
		console.log(plot_setting);
		console.log(x_axisscale.range());
		//origin value saved in orix1,orix2,oriy1,oriy2
		data.forEach(function(d, i) {
					svgContainer.append('line')
							 .attr('class',selector+" "+clas)
							 .attr("clip-path","url(#clip"+selector+")")
							 .attr('x1',function() {
										if(i==0){
											tempx=x_axisscale(d.date);
											predate=d.date
											tempdate=d.date
											return x_axisscale(d.date)+setoff_width;
										}else{
											predate=tempdate
											tempdate=d.date
											prex=tempx;
											tempx=x_axisscale(d.date);
											return prex+setoff_width;
										}}) 
							 .attr('y1',function() {
										if(i==0){
											tempy=d.y;
											return y_axisscale(tempy)+setoff_height
										}else{
											prey=tempy;
											tempy=d.y;
											return y_axisscale(prey)+setoff_height;
										}})
							 .attr('x2',function() {return x_axisscale(d.date)+setoff_width;})
							 .attr('y2',function() {return y_axisscale(d.y)+setoff_height;})
							 .attr('orix1',Date.parse(predate))
							 .attr('orix2',Date.parse(d.date))
							 .attr('oriy1',prey)
							 .attr('oriy2',d.y)
							 .attr('stroke-linecap','round')
							 .attr('stroke-width',3)
							 .attr("opacity",0.95)
							 .style('stroke',function(){return color(selector)})
							 //.attr('clip-path', 'url(#clip'+c+')')
							 //.style('stroke', function(){if(statuson==0) {return color(c)}else{return color4state(d.cate)}})
				}) 
	}	
	
	function drawdots(svgContainer,x_axisscale,y_axisscale,data,clas,tooltip,selector,plot_setting) {
		//used in [scatter_plot_on]
		var container_height=svgContainer.attr("height")
		var container_width=svgContainer.attr("width")
		//for left adjust
		var ywidth_ratio=plot_setting["ywidth_ratio"];
		var xwidth_ratio=plot_setting["xwidth_ratio"];
		var setoff_height=plot_setting["setoff_height"];
		var setoff_width=plot_setting["setoff_width"];
		//adjust for y-axis
		if(container_width*(1-xwidth_ratio)/2>setoff_width){
				var setoff_width=container_width*(1-xwidth_ratio)/2;
		}
		if(container_height*(1-ywidth_ratio)/2>setoff_height){
				var setoff_height=container_height*(1-ywidth_ratio)/2;
		}
		//origin value saved in dx,dy
		svgContainer.selectAll("dot")
					.data(data)
					.enter()
					.append("circle")
					.attr("class",selector+" "+clas)
					.attr("clip-path","url(#clip"+selector+")")
					.attr("r", 4)
					.attr("cx", function(d) {if(1-isNaN(x_axisscale(d.x))){return x_axisscale(d.x)+setoff_width;}})
					.attr("cy", function(d) {if(1-isNaN(y_axisscale(d.y))){return y_axisscale(d.y)+setoff_height;}})
					.attr("dx", function(d) {return d.x;})
					.attr("dy", function(d) {return d.y;})
					.attr("fill",function(){return color(selector)})
					.on("mouseover", function(d) {
						tooltip.transition()		
							.duration(200)		
							.style("opacity", .9);		
						tooltip.html("x:"+parseFloat(d.x).toFixed(2) + "<br/>"  + "y:"+parseFloat(d.y).toFixed(2))
							   .style("left", (d3.event.pageX) + "px")		
							   .style("top", (d3.event.pageY - 28) + "px");		
					})					
					.on("mouseout", function(d) {		
						tooltip.transition()		
							   .duration(500)		
							   .style("opacity", 0);	
					});				
	}

	function addclip(svgContainer,plot_setting,selector){
		//note that things will be clip before translate e.g. dot cx cy 
		//used in [scatter_plot_on,trend_plot_on,empty_plot_on,stream_trend_plot_on]
		var container_height=svgContainer.attr("height");
		var container_width=svgContainer.attr("width");
		
		var ywidth_ratio=plot_setting["ywidth_ratio"];
		var xwidth_ratio=plot_setting["xwidth_ratio"];
		var setoff_height=plot_setting["setoff_height"];
		var setoff_width=plot_setting["setoff_width"];
		


		if(container_width*(1-xwidth_ratio)/2>setoff_width){
				setoff_width=container_width*(1-xwidth_ratio)/2;
		}
		if(container_height*(1-ywidth_ratio)/2>setoff_height){
				setoff_height=container_height*(1-ywidth_ratio)/2;
		}
		var width_clip=container_width-setoff_width-container_width*(1-xwidth_ratio)/2;
		var height_clip=container_height*ywidth_ratio-setoff_height;
		svgContainer.append("defs")
					.append("clipPath")
					.attr("id", "clip"+selector)
					.append("rect")
					.attr("width", width_clip)
					.attr("height", height_clip)
					.attr("transform", "translate("+setoff_width+","+setoff_height+")")
		//a color background
		svgContainer.append("rect")
					.attr("width", width_clip)
					.attr("height", height_clip)
					.attr("transform", "translate("+setoff_width+","+setoff_height+")")
					.style("fill", "#cdc0b0")
					.attr("opacity",0.25)
	}
	
	function exchange_extent(y_extent){
		//cause of reverse axis
		//used in [scatter_plot_on,trend_plot_on,stream_trend_plot_on]
		return[y_extent[1],y_extent[0]]
	}

	//a time sleep function
	function pausecomp(ms) {
		//used in :[stream_trend_plot_on]
		ms += new Date().getTime();
		while (new Date() < ms){}
	} 


	function draw_messagedot(svgContainer,plot_setting,selector,x_axisscale,y_axisscale,temp_date,evt,first,drawset){


		//used in :[stream_trend_plot_on]
		var container_height=svgContainer.attr("height");
		var container_width=svgContainer.attr("width");
		//for left adjust
		var ywidth_ratio=plot_setting["ywidth_ratio"];
		var xwidth_ratio=plot_setting["xwidth_ratio"];
		var setoff_height=plot_setting["setoff_height"];
		var setoff_width=plot_setting["setoff_width"];
		//Here God dame fuck setoff_height
		if(container_width*(1-xwidth_ratio)/2>setoff_width){
				var setoff_width=container_width*(1-xwidth_ratio)/2;
		}
		if(container_height*(1-ywidth_ratio)/2>setoff_height){
				var setoff_height=container_height*(1-ywidth_ratio)/2;
		}
		
		svgContainer.append('line')
			.attr('class',selector+"trend")
			.attr("clip-path","url(#clip"+selector+")")
			.attr('x1',function() {
				if(first==0){
					drawset["trend_pre_date"]=temp_date;
					drawset["trend_temp_x"]=x_axisscale(temp_date);
					drawset["trend_temp_date"]=temp_date;
					if(1-isNaN(drawset["trend_temp_x"])){
						return drawset["trend_temp_x"]+setoff_width;
					}
				}else{
					drawset["trend_pre_date"]=drawset["trend_temp_date"];
					//record newdate
					drawset["trend_temp_date"]=temp_date;

					trend_pre_x=drawset["trend_temp_x"];
					//record new_x
					drawset["trend_temp_x"]=x_axisscale(temp_date);

					if(1-isNaN(trend_pre_x)){
						return trend_pre_x+setoff_width;
					}
				}}) 
			.attr('y1',function() {
				if(first==0){
					drawset["trend_tempy"]=evt.data;
					drawset["trend_prey"]=evt.data;
					if(1-isNaN(y_axisscale(drawset["trend_tempy"]))){
						return y_axisscale(drawset["trend_tempy"])
					}
				}else{
					drawset["trend_prey"]=drawset["trend_tempy"];
					drawset["trend_tempy"]=evt.data;
					if(1-isNaN(y_axisscale(drawset["trend_prey"]))){
						return y_axisscale(drawset["trend_prey"])+setoff_height;
					}
				}})
			.attr('x2',function() {return x_axisscale(temp_date)+setoff_width;})
			.attr('y2',function() {return y_axisscale(evt.data)+setoff_height;})
			.attr('orix1',Date.parse(drawset["trend_pre_date"]))
			.attr('orix2',Date.parse(temp_date))
			.attr('oriy1',drawset["trend_prey"])
			.attr('oriy2',evt.data)
			.attr('stroke-linecap','round')
			.attr('stroke-width',3)
			.attr("opacity",0.95)
			.style('stroke',function(){return color(selector)});

		//color is global variable defined in mscatter_plot.httml
		d3.selectAll("."+selector+"trend").each(function(){return d3.select(this).attr("x1",x_axisscale(d3.select(this).attr("orix1"))+setoff_width) ;});
		d3.selectAll("."+selector+"trend").each(function(){return d3.select(this).attr("x2",x_axisscale(d3.select(this).attr("orix2"))+setoff_width) ;});
		d3.selectAll("."+selector+"trend").each(function(){return d3.select(this).attr("y1",y_axisscale(d3.select(this).attr("oriy1"))+setoff_height) ;});
		d3.selectAll("."+selector+"trend").each(function(){return d3.select(this).attr("y2",y_axisscale(d3.select(this).attr("oriy2"))+setoff_height) ;});

	}


	var WrapperWS =function(svgContainer,selector,plot_setting,time_interval,dataY,target,y_axisscale) {
		
		var trend_temp_x;
		var trend_pre_date;
		var trend_temp_date;

		var trend_tempy;
		var trend_prey;

		var drawset={"trend_temp_x":trend_temp_x,"trend_pre_date":trend_pre_date,"trend_temp_date":trend_temp_date,"trend_tempy":trend_tempy,"trend_prey":trend_prey};

		var first=0;
		//"ws://localhost:8080/websocketServer/"+selector
		//"ws://localhost:8080/websocketServer/"+target
		//ws://echo.websocket.org/
		var wsUri = "ws://localhost:8080/websocketServer/Kafka/"+target;
		console.log(target);
		var websocket = new WebSocket(wsUri);
		websocket.onopen = function(evt) { onOpen(evt) };
		websocket.onclose = function(evt) { onClose(evt) };
		websocket.onmessage = function(evt) { onMessage(evt) };
		websocket.onerror = function(evt) { onError(evt) };

		var onOpen=function (evt){
			console.log("CONNECTED on ");
			websocket.send(Math.random().toFixed(2));

		 }

		var onClose=function (evt){
			console.log("DISCONNECTED");
		  }

		var onMessage=function (evt){
			
			console.log('RESPONSE: '+selector +" "+ evt.data);
			
			dataY.push(parseFloat(evt.data));
			var temp_date=new Date()
			time_interval.push(temp_date);

			if(dataY.length>300){
				dataY.shift();
				time_interval.shift();
			}

			//websocket.close();
			var x_extent=d3.extent(time_interval);
			var y_extent=exten4range(d3.extent(dataY),0.05);

			//at least 0,1
			if(y_extent[0]==y_extent[1]){
				y_extent[1]+=1;
			}
			
			var x_axisscale=d3.time.scale().domain(x_extent);
			
			if(y_axisscale.domain()[0]<y_extent[1]){
				console.log(y_axisscale.domain())
				y_extent[0]=0;
				y_extent=exten4range(y_extent,0.05);
				y_axisscale.domain(exchange_extent(y_extent));
			}
			

			d3.selectAll("."+selector+"left").remove();
			d3.selectAll("."+selector+"bottom").remove();

			//y axis were value axis
			drawaxis(svgContainer,"left",y_axisscale,selector,plot_setting);
			//x axis were time axis
			drawaxis(svgContainer,"bottom",x_axisscale,selector,plot_setting);
			// append a dot
			draw_messagedot(svgContainer,plot_setting,selector,x_axisscale,y_axisscale,temp_date,evt,first,drawset);
			
			//send to echo server
			//pausecomp(1000)
			//websocket.send(Math.random().toFixed(2));
			//send to echo server

			first=first+1;
		}

		var onError=function (evt){
			console.log('Error: ' + evt.data);
		  }

		this.send = function (message, callback) {
		    this.waitForConnection(function () {
		        websocket.send(message);
		        if (typeof callback !== 'undefined') {
		          callback();
		        }
		    }, 1000);
		};

		this.waitForConnection = function (callback, interval) {
		    if (websocket.readyState === 1) {
		        callback();
		    } else {
		        var that = this;
		        // optional: implement backoff for interval here
		        setTimeout(function () {
		            that.waitForConnection(callback, interval);
		        }, interval);
		    }
		};



	}