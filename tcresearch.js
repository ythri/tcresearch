$(function(){
	var latest_version = "4.1.1.14";
	$.each(version_dictionary, function(key,version){
		$("#version").append("<option value="+key+">"+key+"</option>");
	});
	var aspects = [];
	var addon_aspects;
	var combinations = {};
	$("#version").val(latest_version);
	var version=latest_version;
	graph = {};
	function connect(aspect1, aspect2) {
		function addConnection(from, to) {
			if (!(from in graph)) graph[from] = [];
			graph[from].push(to);
		}
		addConnection(aspect1, aspect2);
		addConnection(aspect2, aspect1);
	}
	function aspectSort(a, b) {
		return (a == b) ? 0 : (translate[a]<translate[b]) ? -1 : 1;
	}
	function ddDataSort(a, b) {
		return (a.text == b.text) ? 0 : (a.text<b.text) ? -1 : 1;
	}
	function find(from, to, steps) {
		function search(queue, to, visited) {
			while (!queue.isEmpty()) {
				var element = queue.dequeue();
				var node = element.path.pop();
				if (!(node in visited) || visited[node].indexOf(element.path.length) < 0) {
					element.path.push(node);
					if (node == to && element.path.length > steps + 1) return element.path;
					graph[node].forEach(function(entry) {
						var newpath = element.path.slice();
						newpath.push(entry);
						queue.enqueue({"path":newpath,"length":element.length+getWeight(entry)});
					});
					if (!(node in visited)) visited[node] = [];
					visited[node].push(element.path.length-1);
				}
			}
			return null;
		}

		var queue = new buckets.PriorityQueue(function(a,b) {
			return b.length-a.length;
		});
		queue.enqueue({"path":[from],"length":0});
		visited = {};
		return search(queue, to, visited);
	}
	function push_addons(aspects, combinations) {
		addon_aspects = [];
		addon_array = addon_dictionary;
		$.each(addon_dictionary, function(key, addon_info){
			$("#addons").append('<input type="checkbox" class="addon_toggle" id="'+key+'" /> <label for="'+key+'">'+addon_info["name"]+'</label>');
			$.each(addon_info["aspects"], function(number, aspect){
				addon_aspects.push(aspect);
			});
			$.each(addon_info["combinations"], function(combination_name, combination){
				combinations[combination_name]=combination;
			});
		});
		addon_aspects = addon_aspects.sort(aspectSort);
		$.each(addon_aspects, function(number, aspect){
			aspects.push(aspect);
		});
	}
	function toggle(obj) {
		$(obj).find("img").attr("src", function(i,orig){ return (orig.indexOf("color") < 0) ? orig.replace(/mono/, "color") : orig.replace(/color/, "mono"); });
		$(obj).toggleClass("unavail");
	}
	function toggle_addons(aspect_list){
		aspect_list.forEach(function(e){
			var obj = $('#'+e);
			obj.find("img").attr("src", function(i,orig){ return orig.replace(/color/, "mono"); });
			obj.addClass("unavail");
		});
	}
	function option(value, text) {
		var option = document.createElement("option");
		option.value = value;
		option.textContent = text;
		return option;
	}

	fromSel = document.getElementById("fromSel");
	toSel = document.getElementById("toSel");
	check = document.getElementById("available");
	steps = $("#spinner").spinner({
		min: 1,
		max: 10
	});
	reset_aspects();
	$("#find_connection").click(function(){
		run();
	});
	$('#addons').on("change", ".addon_toggle", function() {
		addon = $(this).attr("id");
		if (this.checked) {
			addon_dictionary[addon]["aspects"].forEach(function(e){
				var obj = $('#'+e);
				obj.find("img").attr("src", function(i,orig){ return orig.replace(/mono/, "color"); });
				obj.removeClass("unavail");
			});
		} else {
			addon_dictionary[addon]["aspects"].forEach(function(e){
				var obj = $('#'+e);
				obj.find("img").attr("src", function(i,orig){ return orig.replace(/color/, "mono"); });
				obj.addClass("unavail");
			});
		}
	});
	$("#sel_all").click(function(){
		$(".aspect").each(function(){
			$(this).find("img").attr("src", function(i,orig){ return orig.replace("mono", "color")});
			$(this).removeClass("unavail");
		});
		$(".addon_toggle").prop('checked', true);
	});
	$("#desel_all").click(function(){
		$(".aspect").each(function(){
			$(this).find("img").attr("src", function(i,orig){ return orig.replace("color", "mono")});
			$(this).addClass("unavail");
		});
		$(".addon_toggle").prop('checked', false);
	});
	$("#version").change(function(){
		version = $("#version").val();
		$(".result").dialog("close");
		reset_aspects();
	});
	$(".aspectlist").on( "click", ".aspect", function(){
		toggle(this);
	});
	$(".aspectlist").on("mouseenter", ".aspect", function() {
		var aspect = $(this).attr("id");
		if (aspect!="fire"&&aspect!="water"&&aspect!="order"&&aspect!="air"&&aspect!="entropy"&&aspect!="earth"){
			var combination = combinations[aspect];
			$("#combination_box #left").html('<img src="aspects/color/' + translate[combination[0]] + '.png" /><div class="name">' + translate[combination[0]] + '</div><div class="desc">' + combination[0] + '</div>');
			$("#combination_box #right").html('<img src="aspects/color/' + translate[combination[1]] + '.png" /><div class="name">' + translate[combination[1]] + '</div><div class="desc">' + combination[1] + '</div>');
			$("#combination_box #equals").html('<img src="aspects/color/' + translate[aspect] + '.png" /><div class="name">' + translate[aspect] + '</div><div class="desc">' + aspect + '</div>');
			$(this).mousemove(function(e) {
				$("#combination_box").css({left:e.pageX+10, top:e.pageY-100}).show();
			});
		} else {
			$("#combination_box").hide();
		}
	});
	$(".aspectlist").on("mouseleave", ".aspect", function() {
		$("#combination_box").hide();
	});
	$("#close_results").click(function(){
		$(".result").dialog("close");
	});
	
	function reset_aspects() {
		aspects = $.extend([], version_dictionary[version]["base_aspects"]);
		combinations = $.extend(true, {}, version_dictionary[version]["combinations"]);
		$("#avail, #addons").empty();
		$('#fromSel').ddslick("destroy");
		$('#toSel').ddslick("destroy");
		$(".addon_toggle").prop('checked', false);
		tier_aspects = [];
		$.each(combinations, function(aspect, value){
			tier_aspects.push(aspect);
		});
		tier_aspects = tier_aspects.sort(aspectSort);
		aspects = aspects.concat(tier_aspects);
		push_addons(aspects, combinations);
		aspects.forEach(function(aspect) {
			$('#avail').append('<li class="aspect" id="'+aspect+'"><img src="aspects/color/' + translate[aspect] + '.png" /><div>' + translate[aspect] + '</div><div class="desc">' + aspect + '</div></li>');
		});
		toggle_addons(addon_aspects);
		var ddData = [];
		aspects.forEach(function(aspect) {
			ddData.push({text: translate[aspect], value: aspect, description: "(" + aspect + ")", imageSrc: "aspects/color/" + translate[aspect] + ".png"});
		});
		ddData.sort(ddDataSort);
		$('#fromSel').ddslick({
			data: ddData,
			defaultSelectedIndex: 0,
			height: 300,
			width: 170
		});
		$('#toSel').ddslick({
			data: ddData,
			defaultSelectedIndex: 0,
			height: 300,
			width: 170
		});
		graph={};
		for (compound in combinations) {
			connect(compound, combinations[compound][0]);
			connect(compound, combinations[compound][1]);
		}
	}
	function run() {
		var fromSel = $('#fromSel').data('ddslick').selectedData.value;
		var toSel = $('#toSel').data('ddslick').selectedData.value;
		var path = find(fromSel, toSel, steps.spinner("value"));
		var id = fromSel+'to'+toSel;
		var title = translate[fromSel]+' &rarr; '+translate[toSel];
		var step_count=0;
		var aspect_count={};
		$.each(aspects, function(aspect, value){
			aspect_count[value]=0;
		});
		$('#'+id).remove();
		$("body").append('<ul id="'+id+'" class="aspectlist result" title="'+title+'"></ul>');
		$('#'+id).dialog({
			autoOpen: false,
			modal: false,
			resizable:false,
			width: 200
		});
		$('#'+id).append("<div></div>");
		var loop_count=0;
		path.forEach(function(e) {
			loop_count++;
			if(loop_count!=1&&loop_count!=path.length) {
				aspect_count[e]++;
				step_count++;
			}
			$('#'+id).append('<li class="aspect_result"><img src="aspects/color/' + translate[e] + '.png" /><div>' + translate[e] + '</div><div class="desc">' + e + '</div></li><li>↓</li>');
		});
		$('#'+id).children().last().remove();
		$('#'+id).append('<li id="aspects_used">Aspects Used</li>');
		var used = '<ul id="aspects_used_list">';
		$.each(aspect_count, function(aspect, value){
			if(value>0) {
				used = $(used).append('<li title="'+translate[aspect]+': '+value+'" style="background-image:url(\'aspects/color/'+translate[aspect]+'.png\')">'+value+'</li>');
			}
		});
		used = $(used).append("<div>Total Steps: "+ step_count+"</div>");
		used = $(used).append('</ul>');
		$('#'+id).append(used);
		$('#'+id).dialog("open");
	}
	function getWeight(aspect) {
		var el = $("#" + aspect);
		return (el.hasClass("unavail")) ? 100 : 1;
	}
});
