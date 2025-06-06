(function($){
    var local_path = window.location.pathname, csrfmiddlewaretoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
    var add_modal_form = "#add_modal_form", edit_modal_form = "#edit_modal_form", service_modal_form = "#service_modal_form";
    var variant_boxes = [add_modal_form, edit_modal_form, service_modal_form];
    var MOROUTER_DICT = {}, SMPPCCM_DICT = {}, HTTPCCM_DICT = {}, FILTERS_DICT = {};
    var collectionlist_check = function(){
        $.ajax({
            url: local_path + 'manage/',
            type: "POST",
            data: {
                csrfmiddlewaretoken: csrfmiddlewaretoken,
                s: "list",

            },
            dataType: "json",
            success: function(data){
                var datalist = data["morouters"];
                var output = $.map(datalist, function(val, i){
                    var html = "";
                    html += `<tr>
                        <td>${i+1}</td>
                        <td>${val.type}</td>
                        <td>${val.order}</td>
                        <td>${JSON.stringify(val.connectors)}</td>
                        <td>${htmlEscape(JSON.stringify(val.filters))}</td>
                        <td class="text-center" style="padding-top:4px;padding-bottom:4px;">
                            <div class="btn-group btn-group-sm">
                                <a href="javascript:void(0)" class="btn btn-light" onclick="return collection_manage('delete', '${i+1}');"><i class="fas fa-trash"></i></a>
                            </div>
                        </td>
                    </tr>`;
                    MOROUTER_DICT[i+1] = val;
                    return html;
                });
                $("#collectionlist").html(datalist.length > 0 ? output : $(".isEmpty").html());
            }, error: function(jqXHR, textStatus, errorThrown){quick_display_modal_error(jqXHR.responseText);}
        });
    }
    collectionlist_check();
    window.collection_manage = function(cmd, index){
        index = index || -1;
        if (cmd == "add") {
            showThisBox(variant_boxes, add_modal_form);
            $("#collection_modal").modal("show");
        } else if (cmd == "delete") {
            sweetAlert({
                title: global_trans["areyousuretodelete"],
                text: global_trans["youwontabletorevertthis"],
                type: 'warning',
                showCancelButton: true,
                cancelButtonClass: "btn btn-secondary m-btn m-btn--pill m-btn--icon",
                cancelButtonText: global_trans["no"],
                confirmButtonClass: "btn btn-danger m-btn m-btn--pill m-btn--air m-btn--icon",
                confirmButtonText: global_trans["yes"],
            }, function(isConfirm){
                if (isConfirm) {
                    var data = MOROUTER_DICT[index];
                    $.ajax({
                    	type: "POST",
                    	url: local_path + 'manage/',
                    	data: {
                    		csrfmiddlewaretoken: csrfmiddlewaretoken,
                    		s: cmd,
                    		order: data.order,
                    	},
                    	beforeSend: function(){},
						success: function(data){
							toastr.success(data["message"], {closeButton: true, progressBar: true,});
							collectionlist_check();
						},
						error: function(jqXHR, textStatus, errorThrown){
							toastr.error(JSON.parse(jqXHR.responseText)["message"], {closeButton: true, progressBar: true,});
						}
                    })
                }
            });
        } else if (cmd == "smppccm") {
            $.ajax({
                url: main_trans.url2smppccm,
                type: "POST",
                data: {
                    csrfmiddlewaretoken,
                    s: "list",
                },
                dataType: "json",
                success: function(data){
                    var datalist = data["connectors"];
                    var html = $.map(datalist, function(val, i){
                        SMPPCCM_DICT[i+1] = val;
                        return `<option>${val.cid}</option>`;
                    });
                    $(add_modal_form+" select[name=smppconnectors]").html(html);
                }
            })
        } else if (cmd == "httpccm") {
            $.ajax({
                url: main_trans.url2httpccm,
                type: "POST",
                data: {
                    csrfmiddlewaretoken,
                    s: "list",
                },
                dataType: "json",
                success: function(data){
                    var datalist = data["connectors"];
                    var html = $.map(datalist, function(val, i){
                        HTTPCCM_DICT[i+1] = val;
                        return `<option>${val.cid}</option>`;
                    });
                    $(add_modal_form+" select[name=httpconnectors]").html(html);
                }
            })
        } else if (cmd == "filters") {
            $.ajax({
                url: main_trans.url2filters,
                type: "POST",
                data: {
                    csrfmiddlewaretoken,
                    s: "list",
                },
                dataType: "json",
                success: function(data){
                    var datalist = data["filters"];
                    var html = $.map(datalist, function(val, i){
                        FILTERS_DICT[i+1] = val;
                        return `<option>${val.fid}</option>`;
                    });
                    $(add_modal_form+" select[name=filters]").html(html);
                }
            })
        }
    }
    collection_manage("smppccm");
    collection_manage("httpccm");
    collection_manage("filters");
    $("#add_new_obj").on('click', function(e){collection_manage('add');});
    $(add_modal_form).on("submit", function(e){
        e.preventDefault();
        var serializeform = $(this).serialize();
		var inputs = $(this).find("input, select, button, textarea");
		//inputs.prop("disabled", true);
		$.ajax({
			type: "POST",
			url: $(this).attr("action"),
			data: serializeform,
			beforeSend: function(){inputs.prop("disabled", true);},
			success: function(data){
				toastr.success(data["message"], {closeButton: true, progressBar: true,});
				inputs.prop("disabled", false);
				$(".modal").modal("hide");
				collectionlist_check();
				//setTimeout(location.reload.bind(location), 2000);
			},
			error: function(jqXHR, textStatus, errorThrown){
				inputs.prop("disabled", false);
				toastr.error(JSON.parse(jqXHR.responseText)["message"], {closeButton: true, progressBar: true,});
			}
		});
    });
    $("li.nav-item.morouter-menu").addClass("active");
})(jQuery);