<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" >
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <InputTemplate :inputItems="item.inputFields" />
        <div class="mb-2" v-if="item.exists" style='overflow-x:auto; height: 550px'>

          <table style="width: 2000px;" class="table table-bordered sticky">
            <thead class="table-active">
            <tr>
              <th style="width: 200px;">{{labels.get('label_crop_type_name')}}</th>
              <th style="width: 100px;">Total Market Size</th>
              <th style="width: 600px;">Pocket Market</th>
              <th style="">Variety</th>
            </tr>
            </thead>
            <tbody class="table-striped table-hover">
            <tr class="row_type" v-for="row in item.rows" :key="'row_'+row.id" :id="'type_'+row.id">

              <td class="col_crop_type_name">{{row.crop_type_name}}</td>
              <td class="col_market_size_total">{{item.market_size_territory[row.id]?item.market_size_territory[row.id]['market_size_total']:''}}</td>
              <td class="col_pocket_market">
                <table class="table table-bordered">
                  <thead>
                  <tr>
                    <th style="width: 150px">Upazilla</th>
                    <th style="">Union</th>
                    <th style="width: 110px"></th>
                  </tr>
                  </thead>
                  <tbody>

                  <template v-if="item.data[row.id]" v-for="(union_ids,upazila_id) in item.data[row.id]['pocket_market']" >
                    <tr>
                      <td>{{item.location_upazilas[upazila_id]?item.location_upazilas[upazila_id]['name']:'NF'}}</td>
                      <td>
                        <template v-for="union_id in union_ids">
                          <input type="hidden" :name="'items['+row.id+'][pocket_market_unions][]'" :value="union_id" />
                          {{item.location_unions[union_id]?item.location_unions[union_id]['name']:'NF'}}<br>
                        </template>
                      </td>
                      <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_union"><i class="bi bi-dash-circle"></i> Remove </button></td>
                    </tr>

                  </template>
                  <tr>
                    <td>
                      <div class="input-group" >
                        <select class="form-control sel_upazila">
                          <option value="0">{{labels.get('label_select')}}</option>
                          <option v-for="upazila in item.location_upazilas_ordered" :value="upazila.id">
                            {{upazila.name}}
                          </option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div class="input-group div_sel_union">
                      </div>
                    </td>
                    <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_union"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                  </tr>
                  </tbody>
                </table>
              </td>
              <td class="col_competitors_info">
                <table class="table table-bordered">
                  <thead>
                  <tr>
                    <th style="width: 150px">Competitor Variety</th>
                    <th style="">Arm Variety</th>
                    <th style="width: 110px"></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="item.data[row.id]" v-for="(competitor_varieties_info,competitor_variety_id) in item.data[row.id]['competitor_varieties']">
                    <td>
                      {{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][competitor_variety_id])?taskData.varieties_competitor_typewise[row.id][competitor_variety_id]['name']:"NF"}}<br>(
                      {{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][competitor_variety_id])?taskData.varieties_competitor_typewise[row.id][competitor_variety_id]['variety_sub_type_name']:"NF"}})<br>(
                      {{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][competitor_variety_id])?taskData.varieties_competitor_typewise[row.id][competitor_variety_id]['competitor_name']:"NF"}})
                      <input type="hidden" :name="'items['+row.id+'][competitor_varieties]['+competitor_variety_id+'][variety_id]'" :value="item.data[row.id]['competitor_varieties'][competitor_variety_id]?item.data[row.id]['competitor_varieties'][competitor_variety_id]['variety_id']:''" />
                    </td>

                    <td>
                      <table class="table table-bordered">
                        <thead>
                        <tr>
                          <th style="width: 150px">Arm Variety</th>
                          <template v-for="m in 12">
                            <th style="width: 100px" v-if="item.season['month_'+m]">{{ labels.get('label_month_short_'+m) }}</th>
                          </template>
                          <th style="width: 150px">Total Qtn</th>
                          <th style="width: 110px"></th>
                        </tr>
                        </thead>
                        <tbody>

                        <tr v-if="item.data[row.id]['arm_varieties'] && item.data[row.id]['arm_varieties'][competitor_variety_id]" v-for="(arm_varieties_info,arm_variety_id) in item.data[row.id]['arm_varieties'][competitor_variety_id]">
                          <td>{{ (taskData.varieties_arm_typewise[row.id] && taskData.varieties_arm_typewise[row.id][arm_variety_id])?taskData.varieties_arm_typewise[row.id][arm_variety_id]['name']+' ('+taskData.varieties_arm_typewise[row.id][arm_variety_id]['variety_sub_type_name']+')':"NF" }}</td>
                          <template v-for="m in 12">
                            <td v-if="item.season['month_'+m]">
                              <input type="text" :name="'items['+[row.id]+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][quantity_month_'+m+']'" :value="arm_varieties_info['quantity_month_'+m]" class="form-control float_positive quantity_month" @input="sumMonthQuantity($event)" />
                            </td>
                          </template>

                          <td><input type="text" :name="'items['+[row.id]+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][quantity_total]'" readonly :value="arm_varieties_info['quantity_total']" class="form-control float_positive quantity_total" /></td>
                          <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_arm_variety"><i class="bi bi-dash-circle"></i> Remove </button></td>

                        </tr>
                        <tr>
                          <td :colspan="item.num_months+2">
                            <div class="input-group" >
                              <select class="form-control sel_arm_variety" :id="'sel_arm_variety_'+competitor_variety_id">
                                <option v-if="taskData.varieties_arm_typewise_ordered[row.id]" v-for="variety in taskData.varieties_arm_typewise_ordered[row.id]" :value="variety.id">
                                  {{variety.name}} ({{variety.variety_sub_type_name}})
                                </option>
                              </select>
                            </div>
                          </td>
                          <td><button type="button" :data-competitor-variety-id="competitor_variety_id" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_arm_variety"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                        </tr>
                        </tbody>
                      </table>
                    </td>
                    <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_competitor"><i class="bi bi-dash-circle"></i> Remove </button></td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <div class="input-group" >
                        <select class="form-control sel_competitor_variety">
                          <option v-if="taskData.varieties_competitor_typewise_ordered[row.id]" v-for="variety in taskData.varieties_competitor_typewise_ordered[row.id]" :value="variety.id">
                            {{variety.competitor_name+'-'+ variety.name}}
                          </option>
                        </select>
                      </div>
                    </td>
                    <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_competitor_size"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                  </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>

import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'

import {useRouter} from "vue-router";
import {inject, reactive} from "vue";
import axios from "axios";
import InputTemplate from '@/components/InputTemplate.vue';
import {useRoute} from "vue-router/dist/vue-router";


const route =useRoute()
const router =useRouter()
let taskData = inject('taskData')
let item=reactive({
  id:0,
  exists:false,
  inputFields:{},
  location_upazilas:{},
  location_upazilas_ordered: {},
  location_unions: {},
  market_size_territory:{},
  season:{},
  num_months:0,
  data:{},
  rows:[]
})
let location_parts_object={};
for(let i in taskData.location_parts){
  let part_id=taskData.location_parts[i]['id'];
  location_parts_object[part_id]=taskData.location_parts[i];
}
let location_areas_object={};
for(let i in taskData.location_areas){
  let area_id=taskData.location_areas[i]['id'];
  location_areas_object[area_id]=taskData.location_areas[i];
}
let location_territories_object={};
for(let i in taskData.location_territories){
  let territory_id=taskData.location_territories[i]['id'];
  location_territories_object[territory_id]=taskData.location_territories[i];
}
for (let i in taskData.seasons){
  if(taskData.seasons[i]['month_'+globalVariables.current_month]==1){
    taskData.season_id=taskData.seasons[i].id;
    break;
  }
}

const setInputFields=async ()=>{
  item.inputFields= {};
  await systemFunctions.delay(1);
  let inputFields={}
  let key='save_token';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'hidden',
    default:new Date().getTime(),
    mandatory:true
  };
  key='fiscal_year';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:new Array(globalVariables.current_fiscal_year-globalVariables.starting_year+1).fill().map((temp,index) => {return {value:globalVariables.current_fiscal_year-index,label:(globalVariables.current_fiscal_year-index)+' - '+(globalVariables.current_fiscal_year-index+1)}}),
    default:globalVariables.current_fiscal_year,
    mandatory:true,
    noselect:true,
  };
  key='season_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.seasons.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
    default:taskData.season_id,
    mandatory:true,
    noselect:true,
  };
  key='part_id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.location_parts.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
    default:'',
    mandatory:false
  };
  if(taskData.user_locations.part_id>0){
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'hidden',
      default:taskData.user_locations.part_id,
      mandatory:true
    };
    key='part_name';
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'textonly',
      default: location_parts_object[taskData.user_locations.part_id]['name'],
      mandatory:false
    };
  }
  key='area_id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:(taskData.user_locations.part_id>0)?taskData.location_areas.filter((temp)=>{ if((temp.part_id==taskData.user_locations.part_id)&&(temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:'',
    mandatory:false
  };
  if(taskData.user_locations.area_id>0){
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'hidden',
      default:taskData.user_locations.area_id,
      mandatory:true
    };
    key='area_name';
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'textonly',
      default: location_areas_object[taskData.user_locations.area_id]['name'],
      mandatory:false
    };
  }
  key='territory_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:(taskData.user_locations.area_id>0)?taskData.location_territories.filter((temp)=>{ if((temp.area_id==taskData.user_locations.area_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:'',
    mandatory:false
  };
  if(taskData.user_locations.territory_id>0){
    inputFields[key] = {
      name: 'item[' +key +']',
      label: labels.get('label_'+key),
      type:'hidden',
      default:taskData.user_locations.territory_id,
      mandatory:true
    };
    key='territory_name';
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'textonly',
      default: location_territories_object[taskData.user_locations.territory_id]['name'],
      mandatory:false
    };
  }
  key='crop_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.crops.map((item)=>{ return {value:item.id,label:item.name}}),
    default:'',
    mandatory:true
  };
  item.inputFields=inputFields;

}
const save=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      item.exists=false;
      $('#crop_id').val('');
      $('#save_token').val(new Date().getTime());

    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}
const getItem=async ()=>{
  item.exists=false;
  let crop_id=$('#crop_id').val();
  let season_id = $("#season_id").val();
  item.num_months=0;
  for(let i=0;i<taskData.seasons.length;i++){
    if(taskData.seasons[i].id==season_id){
      item.season=taskData.seasons[i]
      for(let m=1;m<13;m++){
        if(item.season['month_'+m]){
          item.num_months++;
        }
      }
      name+=taskData.seasons[i].name;
    }
  }

  if(($('#territory_id').val()>0) && (crop_id>0)){
    await systemFunctions.delay(1);
    let formData=new FormData(document.getElementById('formSaveItem'))
    await axios.post(taskData.api_url+'/get-item/0',formData).then((res)=>{
      if (res.data.error == "") {
        item.location_upazilas=res.data.location_upazilas;
        item.location_upazilas_ordered=res.data.location_upazilas_ordered;
        item.location_unions=res.data.location_unions;
        item.market_size_territory=res.data.market_size_territory;

        item.data=res.data.data;
        let rows=[];
        for(let i=0;i<taskData.crop_types.length;i++){
          let crop_type=taskData.crop_types[i];
          if(crop_type['crop_id']!=crop_id)
            continue;
          let row={};
          row['id']=crop_type['id'];
          row['crop_name']=crop_type['crop_name'];
          row['crop_type_name']=crop_type['name'];
          rows.push(row);
        }
        item.rows=rows;
        item.exists=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });

  }

}
setInputFields();
const sumMonthQuantity=(event)=>{
  let total=0;
  $(event.target).closest('tr').find('.quantity_month').each(function ()
  {
    total+=(+$(this).val());
  })
  $(event.target).closest('tr').find('.quantity_total').val(total.toFixed(3))

}
$(document).ready(async function()
{
  $(document).off("change", "#part_id");
  $(document).on("change",'#part_id',async function()
  {
    let part_id=$(this).val();
    let key='area_id';
    item.inputFields[key].options=taskData.location_areas.filter((temp)=>{ if((temp.part_id==part_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    key='territory_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
    item.exists=false;
  })
  $(document).off("change", "#area_id");
  $(document).on("change",'#area_id',async function()
  {
    let area_id=$(this).val();
    let key='territory_id';
    item.inputFields[key].options=taskData.location_territories.filter((temp)=>{ if((temp.area_id==area_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    item.exists=false;
  })
  $(document).off("change", "#territory_id");
  $(document).on("change",'#territory_id',async function()
  {
    getItem()
  })
  $(document).off("change", "#fiscal_year");
  $(document).on("change",'#fiscal_year',async function()
  {
    getItem()
  })
  $(document).off("change", "#season_id");
  $(document).on("change",'#season_id',async function()
  {
    getItem()
  })
  $(document).off("change", "#crop_id");
  $(document).on("change",'#crop_id',async function()
  {
    getItem()
  })


  $(document).off("change", ".sel_upazila");
  $(document).on("change",'.sel_upazila',async function()
  {
    let row_type_id=$(this).closest('.row_type').attr('id');
    let upazila_id=$(this).val();
    if(upazila_id>0){
      let html='<select class="form-control sel_union" multiple>';
      for(let index in item.location_upazilas[upazila_id]['unions']){
        let union=item.location_upazilas[upazila_id]['unions'][index];
        html+=('<option value="'+union['id']+'">'+union['name']+'</option>');
      }
      html+='</select>';
      $('#'+row_type_id+' .div_sel_union').html(html)
      await systemFunctions.delay(1);
      $('#'+row_type_id+' .sel_union').multiselect({
        buttonText: function(options, select) {
          return options.length + ' selected';;
        },
      });
    }
    else{
      $('#'+row_type_id+' .div_sel_union').html('')
    }


  })
  $(document).off("click", ".btn_add_more_union");
  $(document).on("click",'.btn_add_more_union',function()
  {
    let row_type_id=$(this).closest('.row_type').attr('id');
    let crop_type_id=row_type_id.substring(5);//after type_
    let union_ids=$("#"+row_type_id+" .sel_union").val();
    if(union_ids && union_ids.length>0){
      if(union_ids.length>3){
        alert('Please select maximum 3')
      }
      else{
        let upazila_name='';
        let union_names='';

        for(let index in union_ids){
          let union_id=union_ids[index];
          union_names+=('<input type="hidden" name="items['+crop_type_id+'][pocket_market_unions][]" value="'+union_id+'" />'+item.location_unions[union_id]['name']+'</br>')
          upazila_name=item.location_upazilas[item.location_unions[union_id]['upazila_id']]['name'];
        }
        let html='<tr>';
        html+=('<td>'+upazila_name+'</td>');
        html+=('<td>'+union_names+'</td>');
        html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_union"><i class="bi bi-dash-circle"></i> Remove </button></td>';
        html+='</tr>';
        $(this).closest("tr").before(html);

        $('#'+row_type_id+' .div_sel_union').html('')
        $("#"+row_type_id+" .sel_upazila").val(0);
      }
    }
  })
  $(document).off("click", ".btn_remove_union");
  $(document).on("click",'.btn_remove_union',function(){
    $(this).closest('tr').remove();
  });

  $(document).off("click", ".btn_add_more_competitor_size");
  $(document).on("click",'.btn_add_more_competitor_size',function()
  {
    let row_type_id=$(this).closest('.row_type').attr('id');
    let crop_type_id=row_type_id.substring(5);//after type_
    let variety_id=$("#"+row_type_id+" .sel_competitor_variety").val();
    let variety_name="NF";
    let competitor_name="NF";
    let sub_type_name="NF";
    if(variety_id>0){
      variety_name=taskData.varieties_competitor_typewise[crop_type_id][variety_id]['name'];
      competitor_name=taskData.varieties_competitor_typewise[crop_type_id][variety_id]['competitor_name'];
      sub_type_name=taskData.varieties_competitor_typewise[crop_type_id][variety_id]['variety_sub_type_name'];
    }
    let html='<tr>';
    html+=('<td>'+variety_name+'<br> ('+sub_type_name+') <br> ('+competitor_name+')'+'<input type="hidden" name="items['+crop_type_id+'][competitor_varieties]['+variety_id+'][variety_id]" value="'+variety_id+'" /></td>');
    html+=('<td><table class="table table-bordered">');
    html+=('<thead><tr>');
    html+=('<th style="width: 150px">Arm Variety</th>');
    console.log(item.season)
    for(let m=1;m<13;m++){
      if(item.season['month_'+m]){
        html+=('<th style="width: 100px">'+labels.get('label_month_short_'+m)+'</th>')
      }
    }
    html+=('<th style="width: 150px">Total Qtn</th>');
    html+=('<th style="width: 110px"></th>');
    html+=('</tr></thead>');
    html+=('<tbody><tr>');
    html+=('<td colspan="'+(item.num_months+2)+'"><div class="input-group" >');
    html+=('<select class="form-control sel_arm_variety" id="sel_arm_variety_'+variety_id+'">')
    if(taskData.varieties_arm_typewise_ordered[crop_type_id]){
      for(let arm_variety_id in taskData.varieties_arm_typewise_ordered[crop_type_id]){
        let arm_variety=taskData.varieties_arm_typewise_ordered[crop_type_id][arm_variety_id]
        html+=('<option value="'+arm_variety.id+'">'+(arm_variety.name+' ('+arm_variety.variety_sub_type_name+')')+'</option>');
      }
    }
    html+=('</select>');
    html+=('</td>');
    html+=('<td><button type="button" data-competitor-variety-id="'+variety_id+'" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_arm_variety"><i class="bi bi-plus-circle"></i>'+labels.get('action_1')+'</button></td>');
    html+=('</tr></tbody>');

    html+=('</table></td>');

    //html+=('<td>'+variety_name+'<input type="hidden" name="items['+crop_type_id+'][competitor_varieties]['+variety_id+'][variety_id]" value="'+variety_name+'" /></td>');
    //html+=('<td>'+characteristics+'</td>');
    html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_competitor"><i class="bi bi-dash-circle"></i> Remove </button></td>';
    html+='</tr>';
    $(this).closest("tr").before(html);
  })
  $(document).off("click", ".btn_remove_competitor");
  $(document).on("click",'.btn_remove_competitor',function(){
    let row_type_id=$(this).closest('.row_type').attr('id');
    $(this).closest('tr').remove();
  });

  $(document).off("click", ".btn_add_more_arm_variety");
  $(document).on("click",'.btn_add_more_arm_variety',function()
  {
    let row_type_id=$(this).closest('.row_type').attr('id');
    let crop_type_id=row_type_id.substring(5);//after type_
    let competitor_variety_id=$(this).attr('data-competitor-variety-id')
    let arm_variety_id=$("#sel_arm_variety_"+competitor_variety_id).val();
    let variety_name="NF";
    let sub_type_name="NF";
    if(arm_variety_id>0){
      variety_name=taskData.varieties_arm_typewise[crop_type_id][arm_variety_id]['name'];
      sub_type_name=taskData.varieties_arm_typewise[crop_type_id][arm_variety_id]['variety_sub_type_name'];
    }

    let html='<tr>';
    html+=('<td>'+variety_name+'<br> ('+sub_type_name+') '+'<input type="hidden" name="items['+crop_type_id+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][variety_id]" value="'+arm_variety_id+'" /></td>');


    for(let m=1;m<13;m++){
      if(item.season['month_'+m]){
        html+=('<td><input type="text" name="items['+crop_type_id+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][quantity_month_'+m+']" class="form-control float_positive quantity_month"/></td>');
      }
    }
    html+=('<td><input type="text" name="items['+crop_type_id+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][quantity_total]" readonly class="form-control float_positive quantity_total" /></td>');
    html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_arm_variety"><i class="bi bi-dash-circle"></i> Remove </button></td>';
    html+='</tr>';
    let html_elm=$(html);
    html_elm.find('.quantity_month').each(function (){
      $(this).on('input',sumMonthQuantity)
    })
    $(this).closest("tr").before(html_elm);
  })
  $(document).off("click", ".btn_remove_arm_variety");
  $(document).on("click",'.btn_remove_arm_variety',function(){
    $(this).closest('tr').remove();
  });

});
</script>