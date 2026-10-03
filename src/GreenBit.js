jQuery.support.cors = true;
var FPData=null;
function load() {
    var uri = "http://localhost:8080/devices";

	// var test="<div class='col-md-4'>";
			// test+="<form class='probootstrap-form'>";
						// test+="<div class='row'>";
                            // test+="<div class='col-md-12'>";
                                // test+="<div class='form-group'>";
                                    // test+="<label for='people'>Export Format</label>";
                                    // test+="<div class='form-field'>";
                                        // test+="<i class='icon icon-chevron-down'></i>";
                                        // test+="<select name='people' id='scanner' class='form-control'>";
                                            // test+="<option value='#'>Multi Scanner</option>";
                                        // test+="</select>";
                                    // test+="</div>";
                                // test+="</div>";
                            // test+="</div>";
                        // test+="</div>";
			// test+="</form>";
		// test+='</div>';
	// document.getElementById('result').innerHTML =  test;

    $.ajax({
        url: uri,
        type: "GET",
		dataType: 'json',
		accepts: {
			json: 'application/json'
		},
        success: function (obj) {
			if( Array.isArray(obj) ){
				const data = obj[0]
				onSelectScan(data.SerialNumber)
			}
			return
			// var data = obj;

			// console.log("PROCESS: " + data);
			// 	$('#scanner').append(new Option('---Please select scanner---', '0'));

            //     $.each(data, function (val, text) {
			// 		console.log("Inside load",val,text);
			// 		var DevName = text.DeviceName + ' - ' + text.SerialNumber;
			// 		console.log("DevName: " + DevName);
			// 		var SrNo = text.SerialNumber;
			// 		console.log("SrNo: " + SrNo);
            //         $('#scanner').append(new Option(DevName, SrNo));
            //     });

        },
        error: function (response) {
            if (response.readyState === 0)
                alert("Connection Error.... Please check service.");
			else
				alert(response.responseText);
            $('#scanner').append(new Option('No attached scanner found', '0'));
            //console.log(response.readyState);
        }
    })
}

function captureFP(callback) {



    // var objtxt = $("#objToScan option:selected").text();

	// if(objtxt === '')
	// {
	// 	alert("Please select object to scan");
	// 	return;
	// }
    //var objid = $("#objToScan option:selected").val();
    var objid = 1 // $("#objToScan").val();
	var objindex = 0//$("#objToScan option:selected").index();
	var bmpFormat = true//$('#bmp_format').is(":checked");
	var wsqFormat = false//$('#wsq_format').is(":checked");
	var jpgFormat = false//$('#jpg_format').is(":checked");
	var jp2Format = false//$('#jp2_format').is(":checked");
	var jp2fpFormat = false//$('#jp2_fp_format').is(":checked");
	var gb_sampleFormat = false//$('#gb_sample_format').is(":checked");
	var gb_templateFormat = false//$('#gb_template_format').is(":checked");
	var fmr_isoFormat = false//$('#fmr_iso_format').is(":checked");
	var fmr_incitsFormat = false//$('#fmr_incits_format').is(":checked");
	var fmr3_isoFormat = false//$('#fmr3_iso_format').is(":checked");
	var fmc_normalFormat = false//$('#fmc_normal_format').is(":checked");
	var fmc_compactFormat = false//$('#fmc_compact_format').is(":checked");

	/**left_hand**/
	var leftLittle = false//$('#left_little').is(":checked");
	var leftRing =false// $('#left_ring').is(":checked");
	var leftMiddle =false// $('#left_middle').is(":checked");
	var leftIndex =false// $('#left_index').is(":checked");
	var leftThumb =false// $('#left_thumb').is(":checked");
	/**right_hand**/
	var rightLittle =false// $('#right_little').is(":checked");
	var rightRing =false// $('#right_ring').is(":checked");
	var rightMiddle =false// $('#right_middle').is(":checked");
	var rightIndex = false//$('#right_index').is(":checked");
	var rightThumb = false//$('#right_thumb').is(":checked");

	console.log("bmpFormat: " + bmpFormat);
	console.log("wsqFormat: " + wsqFormat);
	console.log("jpgFormat: " + jpgFormat);
	console.log("jp2Format: " + jp2Format);
	console.log("jp2fpFormat: " + jp2fpFormat);
	console.log("gb_sampleFormat: " + gb_sampleFormat);
	console.log("gb_templateFormat: " + gb_templateFormat);
	console.log("fmr_isoFormat: " + fmr_isoFormat);
	console.log("fmr_incitsFormat: " + fmr_incitsFormat);
	console.log("fmr3_isoFormat: " + fmr3_isoFormat);
	console.log("fmc_normalFormat: " + fmc_normalFormat);
	console.log("fmc_compactFormat: " + fmc_compactFormat);

	var objidTmp = '';
	console.log("objid: " + objid);
	/*
	$.each(objid, function (index) {

		console.log("objid: " + objid[index]);
		objidTmp = objidTmp + objid[index] + ',';
	});*/


	//objidTmp.substring(0, objidTmp.length - 1);
    console.log("objidTmp: " + objidTmp);
    var uri = "http://localhost:8080/fingerprints/" + objid;
	var provaUri = uri;

	/**left hand**/
	if(leftLittle){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=10";
			console.log("2) amputatedFingersLittleL: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=10";
			console.log("3) amputatedFingersLittleL: " + provaUri);
		}
		console.log("provaUri amputatedFingersLittleL: " + provaUri);
	}

	if(leftRing){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=9";
			console.log("2) amputatedFingersRingL: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=9";
			console.log("3) amputatedFingersRingL: " + provaUri);
		}
		console.log("provaUri amputatedFingersRingL: " + provaUri);
	}

	if(leftMiddle){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=8";
			console.log("2) amputatedFingersMiddleL: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=8";
			console.log("3) amputatedFingersMiddleL: " + provaUri);
		}
		console.log("provaUri amputatedFingersMiddleL: " + provaUri);
	}

	if(leftIndex){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=7";
			console.log("2) amputatedFingersIndexL: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=7";
			console.log("3) amputatedFingersIndexL: " + provaUri);
		}
		console.log("provaUri amputatedFingersIndexL: " + provaUri);
	}

	if(leftThumb){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=6";
			console.log("2) amputatedFingersThumbL: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=6";
			console.log("3) amputatedFingersThumbL: " + provaUri);
		}
		console.log("provaUri amputatedFingersThumbL: " + provaUri);
	}
	/**right hand**/
	if(rightLittle){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=5";
			console.log("2) amputatedFingersLittleR: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=5";
			console.log("3) amputatedFingersLittleR: " + provaUri);
		}
		console.log("provaUri amputatedFingersLittleR: " + provaUri);
	}

	if(rightRing){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=4";
			console.log("2) amputatedFingersRingR: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=4";
			console.log("3) amputatedFingersRingR: " + provaUri);
		}
		console.log("provaUri amputatedFingersRingR: " + provaUri);
	}

	if(rightMiddle){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=3";
			console.log("2) amputatedFingersMiddleR: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=3";
			console.log("3) amputatedFingersMiddleR: " + provaUri);
		}
		console.log("provaUri amputatedFingersMiddleR: " + provaUri);
	}

	if(rightIndex){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=2";
			console.log("2) amputatedFingersIndexR: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=2";
			console.log("3) amputatedFingersIndexR: " + provaUri);
		}
		console.log("provaUri amputatedFingersIndexR: " + provaUri);
	}

	if(rightThumb){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?amputatedFingers=1";
			console.log("2) amputatedFingersThumbR: " + provaUri);
		} else {
			provaUri = provaUri + "&amputatedFingers=1";
			console.log("3) amputatedFingersThumbR: " + provaUri);
		}
		console.log("provaUri amputatedFingersThumbR: " + provaUri);
	}


	if(!wsqFormat && !jpgFormat && !jp2Format && !jp2fpFormat && !gb_sampleFormat && !gb_templateFormat && !fmr_isoFormat && !fmr_incitsFormat && !fmr3_isoFormat &&
	   !fmc_normalFormat && !fmc_compactFormat){
			bmpFormat = true;
	}

	if(bmpFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=BMP";
			console.log("2) provaUriBMP: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=BMP";
			console.log("3) provaUriBMP: " + provaUri);
		}
		console.log("provaUri BMP: " + provaUri);
	}

	if(wsqFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=WSQ";
			console.log("2) provaUriWSQ: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=WSQ";
			console.log("3) provaUriWSQ: " + provaUri);
		}
		console.log("provaUri WSQ: " + provaUri);
	}

	if(jpgFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=JPG";
			console.log("2) provaUriJPG: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=JPG";
			console.log("3) provaUriJPG: " + provaUri);
		}
		console.log("provaUri JPG: " + provaUri);
	}

	if(jp2Format){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=JP2";
			console.log("2) provaUriJP2: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=JP2";
			console.log("3) provaUriJP2: " + provaUri);
		}
		console.log("provaUri JP2: " + provaUri);
	}

	if(jp2fpFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=JP2_FP";
			console.log("2) provaUriJP2: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=JP2_FP";
			console.log("3) provaUriJP2: " + provaUri);
		}
		console.log("provaUri JP2: " + provaUri);
	}

	if(gb_sampleFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=GB_SAMPLE";
			console.log("2) provaUriJP2: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=GB_SAMPLE";
			console.log("3) provaUriJP2: " + provaUri);
		}
		console.log("provaUri GB_SAMPLE: " + provaUri);
	}

	if(gb_templateFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=GB_TEMPLATE";
			console.log("2) GB_TEMPLATE: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=GB_TEMPLATE";
			console.log("3) provaUriGB_TEMPLATE: " + provaUri);
		}
		console.log("provaUri GB_TEMPLATE: " + provaUri);
	}

	if(fmr_isoFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=FMR_ISO";
			console.log("2) provaUriFMR_ISO: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=FMR_ISO";
			console.log("3) provaUriFMR_ISO: " + provaUri);
		}
		console.log("provaUri FMR_ISO: " + provaUri);
	}

	if(fmr_incitsFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=FMR_INCITS";
			console.log("2) provaUriFMR_INCITS: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=FMR_INCITS";
			console.log("3) provaUriFMR_INCITS: " + provaUri);
		}
		console.log("provaUri FMR_INCITS: " + provaUri);
	}

	if(fmr3_isoFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=FMR3_ISO";
			console.log("2) provaUriFMR3_ISO: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=FMR3_ISO";
			console.log("3) provaUriFMR3_ISO: " + provaUri);
		}
		console.log("provaUri FMR3_ISO: " + provaUri);
	}

	if(fmc_normalFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=FMC_NORMAL";
			console.log("2) provaUriFMC_NORMAL: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=FMC_NORMAL";
			console.log("3) provaUriFMC_NORMAL: " + provaUri);
		}
		console.log("provaUri JP2: " + provaUri);
	}

	if(fmc_compactFormat){
		if (provaUri.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
			provaUri = provaUri + "?outputFormats=FMC_COMPACT";
			console.log("2) provaUriFMC_COMPACT: " + provaUri);
		} else {
			provaUri = provaUri + "&outputFormats=FMC_COMPACT";
			console.log("3) provaUriFMC_COMPACT: " + provaUri);
		}
		console.log("provaUri FMC_COMPACT: " + provaUri);
	}

	var result = "";
    $('#capture').prop('disabled', true);
    $.ajax({
        url: provaUri,
        type: "GET",
        success: function (obj) {
			//var data = JSON.parse(obj);
			var data = obj;

			FPData=data;
				callback(data);
				return
				$.each(data, function (val, text) {

					//console.log("fingerprint val: " + val);
					//console.log("fingerprint text: " + text.Outputs[val].Format);
					//console.log("fingerprint text length output: " + text.Outputs.length);
					/*
					$.each(text.Outputs, function (val2) {

						console.log("fingerprint text inside 2nd each: " + text.Outputs[val2].Format);

					});*/
					$.each(text.Outputs, function (val2) {
							if(text.Outputs != "")
							{

								if(text.Outputs[val2].Format == "BMP")
								{
									//console.log("fingerprint text length output " + val + ": " + text.Outputs[0].length);
									console.log("fingerprint text ObjectID: " + text.ObjectID);

									result += "<div class='col-md-4'>";
									//result += "<a onclick='LoadStringSingle(" + text.ObjectID + ")' class='btn-success col-md-12 btn-block btn-sm' style='text-align:center;cursor: pointer;'>" + text.ObjectName + " (click to load string)</a>";
									result += "<a class='btn-success col-md-12 btn-block btn-sm' style='text-align:center;cursor: pointer;'>" + text.ObjectName + " (BMP format)</a>";
									result += "<p class='table-bordered col-md-12' id='" + text.ObjectID +"'>";
									result += "<img ";
									result += "src='data:image/bmp;base64," + text.Outputs[val2].Base64Data + "' ";
									result += "alt='Fingerprints' class='img-responsive col-md-12'>";
									result += "</p></div>";
								}
								if(text.Outputs[val2].Format == "JPG")
								{
									//console.log("fingerprint text length output " + val + ": " + text.Outputs[0].length);
									console.log("fingerprint text ObjectID: " + text.ObjectID);

									result += "<div class='col-md-4'>";
									//result += "<a onclick='LoadStringSingle(" + text.ObjectID + ")' class='btn-success col-md-12 btn-block btn-sm' style='text-align:center;cursor: pointer;'>" + text.ObjectName + " (click to load string)</a>";
									result += "<a class='btn-success col-md-12 btn-block btn-sm' style='text-align:center;cursor: pointer;'>" + text.ObjectName + " (JPG format)</a>";
									result += "<p class='table-bordered col-md-12' id='" + text.ObjectID +"'>";
									result += "<img ";
									result += "src='data:image/bmp;base64," + text.Outputs[val2].Base64Data + "' ";
									result += "alt='Fingerprints' class='img-responsive col-md-12'>";
									result += "</p></div>";
								}

								if(text.Outputs[val2].ErrorMessage != "")
								{
                  alert("Format " + text.Outputs[val2].Format + ": " + text.Outputs[val2].ErrorMessage);

                  if (text.Outputs[val2].Format == "BMP")
                    bmpFormat = false
                  if (text.Outputs[val2].Format == "WSQ")
                    wsqFormat = false
                  if (text.Outputs[val2].Format == "JPG")
                    jpgFormat = false
                  if (text.Outputs[val2].Format == "JP2")
                    jp2Format = false
                  if (text.Outputs[val2].Format == "JP2_FP")
                    jp2fpFormat = false
                  if (text.Outputs[val2].Format == "GB_SAMPLE")
										gb_sampleFormat = false;
                  if (text.Outputs[val2].Format == "GB_TEMPLATE")
										gb_templateFormat = false;
                  if (text.Outputs[val2].Format == "FMR_ISO")
										fmr_isoFormat = false;
                  if (text.Outputs[val2].Format == "FMR_INCITS")
										fmr_incitsFormat = false;
                  if (text.Outputs[val2].Format == "FMR3_ISO")
										fmr3_isoFormat = false;
                  if (text.Outputs[val2].Format == "FMC_NORMAL")
										fmc_normalFormat = false;
                  if (text.Outputs[val2].Format == "FMC_COMPACT")
										fmc_compactFormat = false;
								}
							}

							if(result == "")
							{
								result += "<div class='col-md-4'>";
								result += "</div>";
							}
					});
      });


			if(bmpFormat ||  wsqFormat || jpgFormat || jp2Format || jp2fpFormat || gb_sampleFormat || gb_templateFormat ||
         fmr_isoFormat || fmr_incitsFormat || fmr3_isoFormat || fmc_normalFormat || fmc_compactFormat)
			{
				var exportoptions="<div class='row'>";
					exportoptions+="</div>";
				exportoptions+="<div class='col-md-4'>";
					exportoptions+="<form class='probootstrap-form'>";
						exportoptions+="<div class='row'>";
                            exportoptions+="<div class='col-md-12'>";
                                exportoptions+="<div class='form-group'>";
                                    exportoptions+="<label for='people'>Export Format</label>";
                                    exportoptions+="<div class='form-field'>";
                                        exportoptions+="<i class='icon icon-chevron-down'></i>";
                                        exportoptions+="<select name='people' id='exportfp' class='form-control'>";
											if(bmpFormat)
												exportoptions+="<option value='#'>BMP</option>";
											if(wsqFormat)
												exportoptions+="<option value='#'>WSQ</option>";
											if(jpgFormat)
												exportoptions+="<option value='#'>JPG</option>";
											if(jp2Format)
												exportoptions+="<option value='#'>JP2</option>";
											if(jp2fpFormat)
												exportoptions+="<option value='#'>JP2_FP</option>";
											if(gb_sampleFormat)
												exportoptions+="<option value='#'>GB_SAMPLE</option>";
											if(gb_templateFormat)
												exportoptions+="<option value='#'>GB_TEMPLATE</option>";
											if(fmr_isoFormat)
												exportoptions+="<option value='#'>FMR_ISO</option>";
											if(fmr_incitsFormat)
												exportoptions+="<option value='#'>FMR_INCITS</option>";
											if(fmr3_isoFormat)
												exportoptions+="<option value='#'>FMR3_ISO</option>";
											if(fmc_normalFormat)
												exportoptions+="<option value='#'>FMC_NORMAL</option>";
											if(fmc_compactFormat)
												exportoptions+="<option value='#'>FMC_COMPACT</option>";
                                        exportoptions+="</select>";
                                    exportoptions+="</div>";
                                exportoptions+="</div>";
								exportoptions+="<input type='text' id='p_id' class='form-control' placeholder='Enter Prefix'><br/>";
								exportoptions+="<a onclick='ExportFP();' class='btn btn-block btn-success'>Export</a>";
                            exportoptions+="</div>";
                        exportoptions+="</div>";
					exportoptions+="</form>";
				exportoptions+='</div>';
				result+=exportoptions;
			}

      document.getElementById('result').innerHTML =  result;
			$('#capture').prop('disabled', false);
        },
        error: function (response) {
            if (response.readyState === 0)
                alert("Connection Error.... Please check service.");
			else
				alert(response.responseText);
            console.log(response);
            $('#capture').prop('disabled', false);
        }
    })



}


/*
function ts(cb) {
  if (cb.readOnly) cb.checked=cb.readOnly=false;
  else if (!cb.checked) cb.readOnly=cb.indeterminate=true;
}*/
function onSelectScan(SrNumber) {
	//var uri = "http://localhost:8080/devices/?serialnum=";
	  var uri = "http://localhost:8080/devices/";
	  var uri2 = "http://localhost:8080/fingerprints/";
	if(SrNumber){
		var SrNo = SrNumber
	}else {
		var DevIndex = $("#scanner option:selected").index();
		$('#objToScan').empty();
	
		if(DevIndex == 0)
			return;
	
		var SrNo = $("#scanner option:selected").val();
		console.log("Prova: " + DevIndex);
		console.log("SrNo: " + SrNo);
	}
	var data='';
	//console.log("SrNo scanner: " + data);
	  $.ajax({
		  url: uri + SrNo,
		  type: "PUT",
		  //data: SrNo,//{ serialnum: SrNo} ,
		  success: function (obj) {
			  data = obj;
			  console.log("Inside");
  
		  },
		  error: function (response) {
			  if (response.readyState === 0)
				  alert("Connection Error.... Please check service.");
  
			  //console.log(response.readyState);
		  },
		  complete: function(){
			  $.ajax({
					  type: "GET",
					  url: uri2,
					  success: function(data){
						console.log(JSON.stringify(data,null,2))
							$.each(data, function (val, text) {
							  //console.log("Inside2");
							  $('#objToScan').append(new Option(text.ObjectName, text.ObjectID));
							  //console.log("ObjToScan: " + $('').val("#objToScan"));
						  });
					  },
					  error: function (response) {
						  if (response.readyState === 0)
						  alert("Connection Error.... Please check service.");
					  }
			  })
  
		  }
	  })
  }



  function selectScanObject(SrNumber) {
	//var uri = "http://localhost:8080/devices/?serialnum=";
	  var uri = "http://localhost:8080/devices/";
	  var uri2 = "http://localhost:8080/fingerprints/";
  
	if(SrNumber){
		var SrNo = SrNumber
	}else{
		var DevIndex = $("#scanner option:selected").index();
		//   $('#objToScan').empty();
	  
		  if(DevIndex == 0)
			  return;
	  
		  var SrNo = $("#scanner option:selected").val();
		  console.log("Prova: " + DevIndex);
		  console.log("SrNo: " + SrNo);
	}
	  var data='';
	  //console.log("SrNo scanner: " + data);
	  $.ajax({
		  url: uri + SrNo,
		  type: "PUT",
		  //data: SrNo,//{ serialnum: SrNo} ,
		  success: function (obj) {
  
			  data = obj;
			  console.log("Inside");
  
		  },
		  error: function (response) {
			  if (response.readyState === 0)
				  alert("Connection Error.... Please check service.");
  
			  //console.log(response.readyState);
		  },
		  complete: function(){
			  $.ajax({
					  type: "GET",
					  url: uri2,
					  success: function(data){
							$.each(data, function (val, text) {
							  //console.log("Inside2");
							  $('#objToScan').append(new Option(text.ObjectName, text.ObjectID));
							  //console.log("ObjToScan: " + $('').val("#objToScan"));
						  });
					  },
					  error: function (response) {
						  if (response.readyState === 0)
						  alert("Connection Error.... Please check service.");
					  }
			  })
  
		  }
	  })
  };  
$( "#scanner" ).change(function() {
  //var uri = "http://localhost:8080/devices/?serialnum=";
	var uri = "http://localhost:8080/devices/";
	var uri2 = "http://localhost:8080/fingerprints/";

	var DevIndex = $("#scanner option:selected").index();
	$('#objToScan').empty();

	if(DevIndex == 0)
		return;

	var SrNo = $("#scanner option:selected").val();
	console.log("Prova: " + DevIndex);
	console.log("SrNo: " + SrNo);
	var data='';
	//console.log("SrNo scanner: " + data);
    $.ajax({
        url: uri + SrNo,
        type: "PUT",
		//data: SrNo,//{ serialnum: SrNo} ,
        success: function (obj) {

			data = obj;
			console.log("Inside");

        },
        error: function (response) {
            if (response.readyState === 0)
                alert("Connection Error.... Please check service.");

            //console.log(response.readyState);
        },
		complete: function(){
			$.ajax({
					type: "GET",
					url: uri2,
					success: function(data){
					  	$.each(data, function (val, text) {
							//console.log("Inside2");
							$('#objToScan').append(new Option(text.ObjectName, text.ObjectID));
							//console.log("ObjToScan: " + $('').val("#objToScan"));
						});
					},
					error: function (response) {
						if (response.readyState === 0)
						alert("Connection Error.... Please check service.");
					}
			})

		}
	})
});

function ExportFP() {

	if(FPData == null)
	{
		alert("Image data not found...");
		return;
	}

	var pid = $("#p_id").val();
	if(pid == '')
	{
		alert("Please enter person id first...");
		return;
	}

	var txt = $("#exportfp option:selected").text();

	switch (txt) {
		case 'WSQ':
			DownloadWSQ(pid);
			break;
		case 'BMP':
			DownloadBMP(pid);
			break;
		case 'JPG':
			DownloadJPG(pid);
			break;
		case 'JP2':
			DownloadJP2(pid);
			break;
    case 'JP2_FP':
  		DownloadJP2_FP(pid);
  		break;
		case 'GB_SAMPLE':
			DownloadGB_SAMPLE(pid);
			break;
		case 'GB_TEMPLATE':
			DownloadGB_TEMPLATE(pid);
			break;
		case 'FMR_ISO':
			DownloadFMR_ISO(pid);
			break;
		case 'FMR_INCITS':
			DownloadFMR_INCITS(pid);
			break;
		case 'FMR3_ISO':
			DownloadFMR3_ISO(pid);
			break;
		case 'FMC_NORMAL':
			DownloadFMC_NORMAL(pid);
			break;
		case 'FMC_COMPACT':
			DownloadFMC_COMPACT(pid);
			break;
	}

}


function DownloadWSQ(pid) {

	$.each(FPData, function (val, text) {
		$.each(text.Outputs, function (val2) {
			if(text.Outputs[val2].Format == "WSQ" && text.Outputs[val2].ErrorMessage == ""){
				download("data:image/wsq;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".wsq", "image/wsq");
			}
		});
     });
}

function DownloadBMP(pid) {

	$.each(FPData, function (val, text) {
		$.each(text.Outputs, function (val2) {
			if(text.Outputs[val2].Format == "BMP" && text.Outputs[val2].ErrorMessage == ""){
				download("data:image/bmp;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".bmp", "image/bmp");
			}
		});
     });
}
function DownloadJPG(pid) {

	$.each(FPData, function (val, text) {
		$.each(text.Outputs, function (val2) {
			if(text.Outputs[val2].Format == "JPG" && text.Outputs[val2].ErrorMessage == ""){
				download("data:image/jpg;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".jpg", "image/jpg");
			}
		});
     });
}
function DownloadJP2(pid) {

	$.each(FPData, function (val, text) {
		$.each(text.Outputs, function (val2) {
			if(text.Outputs[val2].Format == "JP2" && text.Outputs[val2].ErrorMessage == ""){
				download("data:image/jp2;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".jp2", "image/jp2");
			}
		});
     });
}

function DownloadJP2_FP(pid) {

	$.each(FPData, function (val, text) {
		$.each(text.Outputs, function (val2) {
			if(text.Outputs[val2].Format == "JP2_FP" && text.Outputs[val2].ErrorMessage == ""){
				download("data:image/jp2;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".jp2", "image/jp2");
			}
		});
     });
}

function DownloadGB_SAMPLE(pid) {

	$.each(FPData, function (val, text) {
		if(FPData.Outputs != ""){
			$.each(text.Outputs, function (val2) {
				if(text.Outputs[val2].Format == "GB_SAMPLE" && text.Outputs[val2].ErrorMessage == ""){
					download("data:image/GB_SAMPLE;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".GB_SAMPLE", "image/GB_SAMPLE");
				}
			});
		}
     });
}
function DownloadGB_TEMPLATE(pid) {

	$.each(FPData, function (val, text) {
		if(FPData.Outputs != ""){
			$.each(text.Outputs, function (val2) {
				if(text.Outputs[val2].Format == "GB_TEMPLATE" && text.Outputs[val2].ErrorMessage == "" && text.Outputs[val2].Outputs != ""){
					download("data:image/GB_TEMPLATE;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".GB_TEMPLATE", "image/GB_TEMPLATE");
				}
			});
		}
     });
}
function DownloadFMR_ISO(pid) {

	$.each(FPData, function (val, text) {
		if(FPData.Outputs != ""){
			$.each(text.Outputs, function (val2) {
				if(text.Outputs[val2].Format == "FMR_ISO" && text.Outputs[val2].ErrorMessage == "" && text.Outputs[val2].Outputs != ""){
					download("data:image/FMR_ISO;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".FMR_ISO", "image/FMR_ISO");
				}
			});
		}
     });
}
function DownloadFMR_INCITS(pid) {

	$.each(FPData, function (val, text) {
		if(FPData.Outputs != ""){
			$.each(text.Outputs, function (val2) {
				if(text.Outputs[val2].Format == "FMR_INCITS" && text.Outputs[val2].ErrorMessage == "" && text.Outputs[val2].Outputs != ""){
					download("data:image/FMR_INCITS;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".FMR_INCITS", "image/FMR_INCITS");
				}
			});
		}
     });
}
function DownloadFMR3_ISO(pid) {

	$.each(FPData, function (val, text) {
		if(FPData.Outputs != ""){
			$.each(text.Outputs, function (val2) {
				if(text.Outputs[val2].Format == "FMR3_ISO" && text.Outputs[val2].ErrorMessage == "" && text.Outputs[val2].Outputs != ""){
					download("data:image/FMR3_ISO;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".FMR3_ISO", "image/FMR3_ISO");
				}
			});
		}
     });
}
function DownloadFMC_NORMAL(pid) {

	$.each(FPData, function (val, text) {
		if(FPData.Outputs != ""){
			$.each(text.Outputs, function (val2) {
				if(text.Outputs[val2].Format == "FMC_NORMAL" && text.Outputs[val2].ErrorMessage == "" && text.Outputs[val2].Outputs != ""){
					download("data:image/FMC_NORMAL;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".FMC_NORMAL", "image/FMC_NORMAL");
				}
			});
		}
     });
}
function DownloadFMC_COMPACT(pid) {

	$.each(FPData, function (val, text) {
		if(FPData.Outputs != ""){
			$.each(text.Outputs, function (val2) {
				if(text.Outputs[val2].Format == "FMC_COMPACT" && text.Outputs[val2].ErrorMessage == "" && text.Outputs[val2].Outputs != ""){
					download("data:image/FMC_COMPACT;base64," + text.Outputs[val2].Base64Data, pid + '-' + text.ObjectName + ".FMC_COMPACT", "image/FMC_COMPACT");
				}
			});
		}
     });
}

function LoadString() {

	$.each(FPData, function (val, text) {
		if(text.Base64IsoTemplate != '')
		{
			var tbl = "<table class='table-bordered' style='width:100%;'>";
                tbl += "<tr>";
                tbl += "<td style='width:20%;'> base64 template </td>";
                tbl += "<td>";
                tbl += "<textarea class='form-control' rows=10 style='border-radius: 0em;border: 0px'>" + text.Base64IsoTemplate + "</textarea>";
                tbl+="</td>";
                tbl += "</tr>";
                tbl += "</table>";
                document.getElementById(text.ObjectID).innerHTML = tbl;
		}
     });
}

function LoadStringSingle(x) {

	$.each(FPData, function (val, text) {
		if(text.ObjectID == x)
		{
			if(text.Base64IsoTemplate != '')
			{
				var tbl = "<table class='table-bordered' style='width:100%;'>";
                tbl += "<tr>";
                tbl += "<td style='width:20%;'> base64 template </td>";
                tbl += "<td>";
                tbl += "<textarea class='form-control' rows=10 style='border-radius: 0em;border: 0px'>" + text.Base64IsoTemplate + "</textarea>";
                tbl+="</td>";
                tbl += "</tr>";
                tbl += "</table>";
                document.getElementById(text.ObjectID).innerHTML = tbl;
			}
			else
			{
				var tbl = "<table class='table-bordered' style='width:100%;'>";
                tbl += "<tr>";
                tbl += "<td style='width:20%;'> ERROR </td>";
                tbl += "<td>";
                tbl += "<textarea class='form-control' rows=10 style='border-radius: 0em;border: 0px'> ERROR : " + text.ISOConvertErrMsg + "</textarea>";
                tbl+="</td>";
                tbl += "</tr>";
                tbl += "</table>";
                document.getElementById(text.ObjectID).innerHTML = tbl;
			}
		}
     });
}
//BRUNO
function setUrlParameter(url, key, value) {
    var key = encodeURIComponent(key),
        value = encodeURIComponent(value);

    var baseUrl = url.split('?')[0],
        newParam = key + '=' + value,
        params = '?' + newParam;

		console.log("1) url: " + url);

    if (url.split('?')[1] === undefined){ // if there are no query strings, make urlQueryString empty
        urlQueryString = '';
		console.log("2) url: " + url);
    } else {
        urlQueryString = '?' + url.split('?')[1];
		console.log("3) url: " + url);
    }

    // If the "search" string exists, then build params from it
    if (urlQueryString) {
        var updateRegex = new RegExp('([\?&])' + key + '[^&]*');
        var removeRegex = new RegExp('([\?&])' + key + '=[^&;]+[&;]?');


        if (value === undefined || value === null || value === '') { // Remove param if value is empty
            params = urlQueryString.replace(removeRegex, "$1");
            params = params.replace(/[&;]$/, "");
			console.log("4) url: " + url);

        } else if (urlQueryString.match(updateRegex) !== null) { // If param exists already, update it
            params = urlQueryString.replace(updateRegex, "$1" + newParam);
			console.log("5) url: " + url);

        } else if (urlQueryString == '') { // If there are no query strings
            params = '?' + newParam;
			console.log("6) url: " + url);
        } else { // Otherwise, add it to end of query string
            params = urlQueryString + '&' + newParam;
			console.log("7) url: " + url);
        }
    }

    // no parameter was set so we don't need the question mark
    params = params === '?' ? '' : params;

    return baseUrl + params;
}

///////////////////////////////////////////////////
///////    download.js Content    ////////////////
//////////////////////////////////////////////////

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.download = factory();
  }
}(this, function () {

	return function download(data, strFileName, strMimeType) {

		var self = window, // this script is only for browsers anyway...
			defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
			mimeType = strMimeType || defaultMime,
			payload = data,
			url = !strFileName && !strMimeType && payload,
			anchor = document.createElement("a"),
			toString = function(a){return String(a);},
			myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
			fileName = strFileName || "download",
			blob,
			reader;
			myBlob= myBlob.call ? myBlob.bind(self) : Blob ;

		if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
			payload=[payload, mimeType];
			mimeType=payload[0];
			payload=payload[1];
		}


		if(url && url.length< 2048){ // if no filename and no mime, assume a url was passed as the only argument
			fileName = url.split("/").pop().split("?")[0];
			anchor.href = url; // assign href prop to temp anchor
		  	if(anchor.href.indexOf(url) !== -1){ // if the browser determines that it's a potentially valid url path:
        		var ajax=new XMLHttpRequest();
        		ajax.open( "GET", url, true);
        		ajax.responseType = 'blob';
        		ajax.onload= function(e){
				  download(e.target.response, fileName, defaultMime);
				};
        		setTimeout(function(){ ajax.send();}, 0); // allows setting custom ajax headers using the return:
			    return ajax;
			} // end if valid url?
		} // end if url?


		//go ahead and download dataURLs right away
		if(/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)){

			if(payload.length > (1024*1024*1.999) && myBlob !== toString ){
				payload=dataUrlToBlob(payload);
				mimeType=payload.type || defaultMime;
			}else{
				return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
					navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
					saver(payload) ; // everyone else can save dataURLs un-processed
			}

		}//end if dataURL passed?

		blob = payload instanceof myBlob ?
			payload :
			new myBlob([payload], {type: mimeType}) ;


		function dataUrlToBlob(strUrl) {
			var parts= strUrl.split(/[:;,]/),
			type= parts[1],
			decoder= parts[2] == "base64" ? atob : decodeURIComponent,
			binData= decoder( parts.pop() ),
			mx= binData.length,
			i= 0,
			uiArr= new Uint8Array(mx);

			for(i;i<mx;++i) uiArr[i]= binData.charCodeAt(i);

			return new myBlob([uiArr], {type: type});
		 }

		function saver(url, winMode){

			if ('download' in anchor) { //html5 A[download]
				anchor.href = url;
				anchor.setAttribute("download", fileName);
				anchor.className = "download-js-link";
				anchor.innerHTML = "downloading...";
				anchor.style.display = "none";
				document.body.appendChild(anchor);
				setTimeout(function() {
					anchor.click();
					document.body.removeChild(anchor);
					if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(anchor.href);}, 250 );}
				}, 66);
				return true;
			}

			// handle non-a[download] safari as best we can:
			if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
				url=url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
				if(!window.open(url)){ // popup blocked, offer direct download:
					if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
				}
				return true;
			}

			//do iframe dataURL download (old ch+FF):
			var f = document.createElement("iframe");
			document.body.appendChild(f);

			if(!winMode){ // force a mime that will download:
				url="data:"+url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
			}
			f.src=url;
			setTimeout(function(){ document.body.removeChild(f); }, 333);

		}//end saver




		if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
			return navigator.msSaveBlob(blob, fileName);
		}

		if(self.URL){ // simple fast and modern way using Blob and URL:
			saver(self.URL.createObjectURL(blob), true);
		}else{
			// handle non-Blob()+non-URL browsers:
			if(typeof blob === "string" || blob.constructor===toString ){
				try{
					return saver( "data:" +  mimeType   + ";base64,"  +  self.btoa(blob)  );
				}catch(y){
					return saver( "data:" +  mimeType   + "," + encodeURIComponent(blob)  );
				}
			}

			// Blob but not URL support:
			reader=new FileReader();
			reader.onload=function(e){
				saver(this.result);
			};
			reader.readAsDataURL(blob);
		}
		return true;
	}; /* end download() */
}));
