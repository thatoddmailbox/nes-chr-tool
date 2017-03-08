CHRTool = {
	currentTile: 0,
	paletteColors: {
		0x00: "#656565",
		0x01: "#002d69",
		0x02: "#131f7f",
		0x03: "#3c137c",
		0x04: "#600b62",
		0x05: "#730a37",
		0x06: "#710f07",
		0x07: "#5a1a00",
		0x08: "#342800",
		0x09: "#0b3400",
		0x0a: "#003c00",
		0x0b: "#003d10",
		0x0c: "#003840",
		0x0d: "#000000",
		0x0e: "#000000",
		0x0f: "#000000",
		0x10: "#aeaeae",
		0x11: "#0f63b3",
		0x12: "#4051d0",
		0x13: "#7841cc",
		0x14: "#a736a9",
		0x15: "#c03470",
		0x16: "#bd3c30",
		0x17: "#9f4a00",
		0x18: "#6d5c00",
		0x19: "#366d00",
		0x1a: "#077704",
		0x1b: "#00793d",
		0x1c: "#00727d",
		0x1d: "#000000",
		0x1e: "#000000",
		0x1f: "#000000",
		0x20: "#fefeff",
		0x21: "#5db3ff",
		0x22: "#81a1ff",
		0x23: "#c890ff",
		0x24: "#f785fa",
		0x25: "#ff83c0",
		0x26: "#ff8b7f",
		0x27: "#ef9a49",
		0x28: "#bdac2c",
		0x29: "#85bc2f",
		0x2a: "#55c753",
		0x2b: "#3cc98c",
		0x2c: "#3ec2cd",
		0x2d: "#4e4e4e",
		0x2e: "#000000",
		0x2f: "#000000",
		0x30: "#fefeff",
		0x31: "#bcdfff",
		0x32: "#d1d8ff",
		0x33: "#e8d1ff",
		0x34: "#fbcdfd",
		0x35: "#ffcce5",
		0x36: "#ffcfca",
		0x37: "#f8d5b4",
		0x38: "#e4dca8",
		0x39: "#cce3a9",
		0x3a: "#b9e8b8",
		0x3b: "#aee8d0",
		0x3c: "#afe5ea",
		0x3d: "#b6b6b6",
		0x3e: "#000000",
		0x3f: "#000000"
	},

	tiles: {

	},

	renderTile: function(data) {
		var canvas = $("#offscreenRenderTarget")[0];
		var c = canvas.getContext("2d");
		var imageData = c.createImageData(8, 8);

		var color1 = CHRTool.paletteColors[parseInt($("#paletteColor1").val())].substr(1);
		var color2 = CHRTool.paletteColors[parseInt($("#paletteColor2").val())].substr(1);
		var color3 = CHRTool.paletteColors[parseInt($("#paletteColor3").val())].substr(1);

		for (var i = 0; i < 8; i++) {
			var secondRow = data[i + 8];
			var firstRow = data[i];
			for (var j = 7; j >= 0; j--) {
				var secondBit = (secondRow >> j) & 0x01;
				var firstBit = (firstRow >> j) & 0x01;
				var state = (secondBit << 1) | firstBit;
				var index = ((i * 8) + (7 - j)) * 4;

				if (state == 0) {
					imageData.data[index] = 0;
					imageData.data[index + 1] = 0;
					imageData.data[index + 2] = 0;
					imageData.data[index + 3] = 0;
					continue;
				}

				var color = color1;
				if (state == 2) {
					color = color2;
				} else if (state == 3) {
					color = color3;
				}

				imageData.data[index] = parseInt(color.substr(0, 2), 16);
				imageData.data[index + 1] = parseInt(color.substr(2, 2), 16);
				imageData.data[index + 2] = parseInt(color.substr(4, 2), 16);
				imageData.data[index + 3] = 255;
			}
		}

		c.putImageData(imageData, 0, 0);

		return canvas.toDataURL('image/png');
	},

	updateColors: function() {
		var color1 = CHRTool.paletteColors[parseInt($("#paletteColor1").val())];
		var color2 = CHRTool.paletteColors[parseInt($("#paletteColor2").val())];
		var color3 = CHRTool.paletteColors[parseInt($("#paletteColor3").val())];

		$(".state-0").css("background-color", "transparent");
		$(".state-1").css("background-color", color1);
		$(".state-2").css("background-color", color2);
		$(".state-3").css("background-color", color3);
	},

	updateTileImages: function() {
		for (var tileIndex in CHRTool.tiles) {
			var tile = CHRTool.tiles[tileIndex];
			$("#tile-" + tileIndex).css("background-image", "url(" + CHRTool.renderTile(tile.data) + ")");
		}
	}
};

$(document).ready(function() {
	for (var nesColor in CHRTool.paletteColors) {
		$(".colorSelect").append("<option style='background-color:" + CHRTool.paletteColors[nesColor] + ";color:white;'>0x" + Number(nesColor).toString(16) + "</option>");
	}

	$(".colorSelect").change(function() {
		CHRTool.updateColors();
		CHRTool.updateTileImages();
	});

	$("#paletteColor1").val("0x0");
	$("#paletteColor2").val("0x10");
	$("#paletteColor3").val("0x20");

	$("#openFile").click(function() {
		$("#offscreenFileSelector").click();
	});

	$("#downloadFile").click(function() {
		var file = new Uint8Array(8192);
		for (var tileIndex in CHRTool.tiles) {
			var tile = CHRTool.tiles[tileIndex];
			file.set(tile.data, tileIndex * 16);
		}
		var blob = new Blob([ file ], {
			type: "application/octet-socket"
		});
		var url = window.URL.createObjectURL(blob);
		// why does this work?
		// it shouldn't work, but it does
		// ???
		$("#hackyDownloadLink").attr("href", url);
		$("#hackyDownloadLink").attr("download", "data.chr");
		console.log(url);
		setTimeout(function() {
		    return window.URL.revokeObjectURL(url);
		}, 1000);
	});

	$("#offscreenFileSelector").change(function() {
		var file = $(this)[0].files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
			var buffer = e.target.result;
			var data = new Uint32Array(buffer);

			for (var i = 0; i < data.length; i++) {
				var currentTile = Math.floor(i / 4);
				var currentOffset = i % 4;
				var tile = data[i];

				if (!CHRTool.tiles[currentTile]) {
					CHRTool.tiles[currentTile] = {
						data: [],
					};
				}

				CHRTool.tiles[currentTile].data[(currentOffset * 4)] = (tile) & 0xFF;
				CHRTool.tiles[currentTile].data[(currentOffset * 4) + 1] = (tile >> 8) & 0xFF;
				CHRTool.tiles[currentTile].data[(currentOffset * 4) + 2] = (tile >> 16) & 0xFF;
				CHRTool.tiles[currentTile].data[(currentOffset * 4) + 3] = (tile >> 24) & 0xFF;
			}

			CHRTool.updateTileImages();
		};
		reader.readAsArrayBuffer(file);
	});

	for (var i = 0; i < 8; i++) {
		var $row = $("<tr></tr>");
			for (var j = 0; j < 8; j++) {
				var $cell = $("<td></td>");
					$cell.addClass("editorTile");
					$cell.addClass("state-0");
					$cell.attr("data-x", j);
					$cell.attr("data-y", i);
					$cell.attr("data-state", 0);
					$cell.click(function() {
						var x = $(this).attr("data-x");
						var y = $(this).attr("data-y");
						var state = parseInt($(this).attr("data-state"));

						$(this).removeClass("state-" + state);

						state++;
						if (state == 4) {
							state = 0;
						}

						$(this).attr("data-state", state);
						$(this).addClass("state-" + state);

						for (var i = 0; i < 8; i++) {
							var secondRow = 0;
							var firstRow = 0;
							for (var j = 0; j < 8; j++) {
								var $tile = $(".editorTile[data-x=" + j + "][data-y=" + i + "]");
								var tileState = parseInt($tile.attr("data-state"));

								var secondBit = tileState >> 1;
								var firstBit = tileState & 0x1;

								secondRow = secondRow | (secondBit << (7 - j));
								firstRow = firstRow | (firstBit << (7 - j));
							}
							CHRTool.tiles[CHRTool.currentTile].data[i] = firstRow;
							CHRTool.tiles[CHRTool.currentTile].data[i + 8] = secondRow;
						}

						CHRTool.updateColors();
						$(".tile.selected").css("background-image", "url(" + CHRTool.renderTile(CHRTool.tiles[CHRTool.currentTile].data) + ")");
					});
				$row.append($cell);
			}
		$("#editor tbody").append($row);
	}

	for (var i = 0; i < 16; i++) {
		var $row = $("<tr></tr>");
			for (var j = 0; j < 32; j++) {
				var $cell = $("<td></td>");
					$cell.addClass("tile");
					$cell.attr("id", "tile-" + ((i * 32) + j));
					$cell.click(function() {
						$(".tile.selected").removeClass("selected");
						$(this).addClass("selected");

						$(".editorTile").removeClass("state-0");
						$(".editorTile").removeClass("state-1");
						$(".editorTile").removeClass("state-2");
						$(".editorTile").removeClass("state-3");

						var tile = parseInt($(this).attr("id").split("-")[1]);
						CHRTool.currentTile = tile;
						for (var i = 0; i < 8; i++) {
							var secondRow = CHRTool.tiles[tile].data[i + 8];
							var firstRow = CHRTool.tiles[tile].data[i];
							for (var j = 7; j >= 0; j--) {
								var secondBit = (secondRow >> j) & 0x01;
								var firstBit = (firstRow >> j) & 0x01;
								var state = (secondBit << 1) | firstBit;

								$(".editorTile[data-x=" + (7 - j) + "][data-y=" + i + "]").attr("data-state", state);
								$(".editorTile[data-x=" + (7 - j) + "][data-y=" + i + "]").addClass("state-" + state);
							}
						}
						CHRTool.updateColors();
					});
				$row.append($cell);
			}
		$("#tiles tbody").append($row);
	}
});