$(function(){
	$.each(version_dictionary, function(key,version){
		$("#version").append("<option value="+key+">"+key+"</option>");
	});
	var latest_version = "4.1.0g";
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

	function output(path) {
		var output = [];
		path.forEach(function(e) {
			output.push(translate[e] + " (" + e + ")");
		});
		return output.join(" -> ");
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
	translate = { "air": "aer", "earth": "terra", "fire": "ignis", "water": "aqua", "order": "ordo", "entropy": "perditio", "void": "vacuos", "light": "lux", "energy": "potentia", "motion": "motus", "stone": "saxum", "life": "victus", "weather": "tempestas", "ice": "gelum", "crystal": "vitreus", "death": "mortuus", "flight": "volatus", "darkness": "tenebrae", "soul": "spiritus", "heal": "sano", "travel": "iter", "poison": "venenum", "eldritch": "alienis", "magic": "praecantatio", "aura": "auram", "taint": "vitium", "seed": "granum", "slime": "limus", "plant": "herba", "tree": "arbor", "beast": "bestia", "flesh": "corpus", "undead": "exanimis", "mind": "cognitio", "senses": "sensus", "man": "humanus", "crop": "messis", "harvest": "meto", "metal": "metallum", "mine": "perfodio", "tool": "instrumentum", "weapon": "telum", "armor": "tutamen", "hunger": "fames", "greed": "lucrum", "craft": "fabrico", "cloth": "pannus", "mechanism": "machina", "trap": "vinculum", "exchange": "permutatio", "wrath": "ira", "nether": "infernus", "gluttony": "gula", "envy": "invidia", "sloth": "desidia", "pride": "superbia", "lust": "luxuria", "time": "tempus" };
	fm = [ "wrath", "nether", "gluttony", "envy", "sloth", "pride", "lust" ]
	mb = [ "time" ];
	for (compound in version_dictionary[version]["combinations"]) {
		connect(compound, version_dictionary[version]["combinations"][compound][0]);
		connect(compound, version_dictionary[version]["combinations"][compound][1]);
	}
	function toggle(obj) {
		$(obj).find("img").attr("src", function(i,orig){ return (orig.indexOf("color") < 0) ? orig.replace(/mono/, "color") : orig.replace(/color/, "mono"); });
		$(obj).toggleClass("unavail");
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
		min: 0,
		max: 10
	});
	reset_aspects();
	$("#find_connection").click(function(){
		run();
	});
	$('#fm').click(function() {
		if (this.checked) {
			fm.forEach(function(e){
				var obj = $('#'+e);
				obj.find("img").attr("src", function(i,orig){ return orig.replace(/mono/, "color"); });
				obj.removeClass("unavail");
			});
		} else {
			fm.forEach(function(e){
				var obj = $('#'+e);
				obj.find("img").attr("src", function(i,orig){ return orig.replace(/color/, "mono"); });
				obj.addClass("unavail");
			});
		}
	});
	$('#mb').click(function() {
		if (this.checked) {
			mb.forEach(function(e){
				var obj = $('#'+e);
				obj.find("img").attr("src", function(i,orig){ return orig.replace(/mono/, "color"); });
				obj.removeClass("unavail");
			});
		} else {
			mb.forEach(function(e){
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
		$("#fm").prop('checked', true);
		$("#mb").prop('checked', true);
	});
	$("#desel_all").click(function(){
		$(".aspect").each(function(){
			$(this).find("img").attr("src", function(i,orig){ return orig.replace("color", "mono")});
			$(this).addClass("unavail");
		});
		$("#fm").prop('checked', false);
		$("#mb").prop('checked', false);
	});
	$("#version").change(function(){
		version = $("#version").val();
		reset_aspects();
	});
	$(".aspectlist").on( "click", ".aspect", function(){
		toggle(this);
	});
	$(".aspectlist").on("mouseenter", ".aspect", function() {
		var aspect = $(this).attr("id");
		if (aspect!="fire"&&aspect!="water"&&aspect!="order"&&aspect!="air"&&aspect!="entropy"&&aspect!="earth"){
			var combination = version_dictionary[version]["combinations"][aspect];
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
	$(".aspectlist").mouseleave(function() {
		$("#combination_box").hide();
	});
	$("#close_results").click(function(){
		$(".result").dialog("close");
	});
	function reset_aspects() {
		aspects = version_dictionary[version]["aspects"];
		aspects.sort(function(a,b){
			return (a == b) ? 0 : (translate[a]<translate[b]) ? -1 : 1;
		});
		$("#avail").empty();
		$('#fromSel').ddslick("destroy");
		$('#toSel').ddslick("destroy");
		$("#fm").prop('checked', false);
		$("#mb").prop('checked', false);
		aspects.forEach(function(aspect) {
			if (fm.indexOf(aspect) < 0 && mb.indexOf(aspect) < 0) {
				$('#avail').append('<li class="aspect" id="'+aspect+'"><img src="aspects/color/' + translate[aspect] + '.png" /><div>' + translate[aspect] + '</div><div class="desc">' + aspect + '</div></li>');
			} else {
				$('#avail').append('<li class="aspect unavail" id="'+aspect+'"><img src="aspects/mono/' + translate[aspect] + '.png" /><div>' + translate[aspect] + '</div><div class="desc">' + aspect + '</div></li>');
			}
		});
		var ddData = [];
		aspects.forEach(function(aspect) {
			ddData.push({text: translate[aspect], value: aspect, description: "(" + aspect + ")", imageSrc: "aspects/color/" + translate[aspect] + ".png"});
		});
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
	}
	function run() {
		var fromSel = $('#fromSel').data('ddslick').selectedData.value;
		var toSel = $('#toSel').data('ddslick').selectedData.value;
		var path = find(fromSel, toSel, steps.spinner("value"));
		var id = fromSel+'to'+toSel;
		var title = translate[fromSel]+' &rarr; '+translate[toSel];
		var count={};
		$.each(version_dictionary[version]["aspects"], function(aspect, value){
			count[value]=0;
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
		path.forEach(function(e) {
			count[e]++;
			$('#'+id).append('<li class="aspect_result"><img src="aspects/color/' + translate[e] + '.png" /><div>' + translate[e] + '</div><div class="desc">' + e + '</div></li><li>↓</li>');
		});
		$('#'+id).children().last().remove();
		$('#'+id).append('<li id="aspects_used">Aspects Used</li>');
		var used = '<ul id="aspects_used_list">';
		$.each(count, function(aspect, value){
			if(value>0) {
				used = $(used).append('<li title="'+translate[aspect]+': '+value+'" style="background-image:url(\'aspects/color/'+translate[aspect]+'.png\')">'+value+'</li>');
			}
		});
		used = $(used).append('</ul>');
		$('#'+id).append(used);
		$('#'+id).dialog("open");
	}
	function getWeight(aspect) {
		var el = $("#" + aspect);
		return (el.hasClass("unavail")) ? 100 : 1;
	}
});