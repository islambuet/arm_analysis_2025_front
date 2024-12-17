<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(true)"><i class="feather icon-plus-square"></i> {{labels.get('label_save_new')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      <div v-if="item.id>0">{{labels.get('label_edit_task')}}({{item.name}})</div>
      <div v-else>{{labels.get('label_new_task')}}</div>
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;'>
      <form id="formSaveItem">
        <table style="width: 2000px;" class="table table-bordered">
          <thead class="table-active">
            <tr>
              <th style="width: 150px;">{{labels.get('label_crop_name')}}</th>
              <th style="width: 200px;">{{labels.get('label_crop_type_name')}}</th>
              <th style="width: 100px;">Total Market Size</th>
              <th style="width: 600px;">Upazila Market Size</th>
              <th style="width: 200px;">Sowing Period</th>
              <th style="width: 100px;">Arm Market Size</th>
              <th style="width: 600px;">Competitors Variety</th>
            </tr>
          </thead>
          <tbody class="table-striped table-hover">
            <tr class="row_type" v-for="row in item.rows" :key="'row_'+row.id" :id="'type_'+row.id">
              <td class="col_crop_name">{{row.crop_name}}</td>
              <td class="col_crop_type_name">{{row.crop_type_name}}</td>
              <td class="col_market_size_total text-right">0.000</td>
              <td class="col_market_size_upazilas">
                <table class="table table-bordered">
                  <thead>
                  <tr>
                    <th style="width: 100px">Upzila</th>
                    <th style="width: 100px">Market Size</th>
                    <th style="width: 200px">Unions</th>
                    <th style="width: 100px"></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td colspan="3">
                      <div class="input-group" >
                        <select class="form-control sel_upazila">
                          <option v-for="upazila in item.location_upazilas" :value="upazila.id">
                            {{upazila.name}}
                          </option>
                          <option value="0">Other</option>
                        </select>
                      </div>
                    </td>
                    <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_upazila"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                  </tr>
                  </tbody>
                </table>
              </td>
              <td class="col_sowing_periods">
                <div v-for="i in 12" class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" :id="'sowing_periods_'+i" :value="i"><label class="form-check-label" :for="'sowing_periods_'+i">{{ labels.get('label_month_short_'+i) }}</label>
                </div>
              </td>
              <td class="col_market_size_arm text-right">0.000</td>
              <td class="col_market_size_competitors">
                <table class="table table-bordered">
                  <thead>
                  <tr>
                    <th>Company</th>
                    <th>Variety</th>
                    <th>Market Size</th>
                    <th>Reason for the Sales</th>
                    <th style="width: 110px"></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td colspan="4">
                      <div class="input-group" >
                        <select class="form-control sel_competitor_variety">
                          <option value="0">Other</option>
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
  name:'',
  exists:false,
  inputFields:{},
  data:[],
  location_upazilas:[],
  location_unions: {},
  rows:[]
})
$(document).ready(function()
{
  $(document).off("click", ".btn_add_more_upazila");
  $(document).on("click",'.btn_add_more_upazila',function()
  {
    let row_type_id=$(this).closest('.row_type').attr('id');
    let crop_type_id=row_type_id.substring(5);//after type_
    let upazila_id=$("#"+row_type_id+" .sel_upazila").val();
    let upazila_name="Other";
    let unions=[];
    if(upazila_id>0){
      for(let i=0;i<item.location_upazilas.length;i++){
        if(item.location_upazilas[i].id==upazila_id){
          upazila_name=item.location_upazilas[i].name;
          break;
        }
      }
      if(item.location_unions[upazila_id]){
        unions=item.location_unions[upazila_id];
      }
    }

    let html='<tr>';
    html+=('<td>'+upazila_name+'</td>');
    html+=('<td><input type="text" class="form-control float_positive input_upazila_market_size" /></td>');
    html+='<td>';
    for(let i=0;i<unions.length;i++){
      let union=unions[i];
      html+=('<div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" id="'+(row_type_id+"_"+union.id)+'" value="'+union.id+'"><label class="form-check-label" for="'+(row_type_id+"_"+union.id)+'">'+union.name+'</label></div>');
    }
    html+='</td>';
    html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_upazila"><i class="bi bi-dash-circle"></i> Remove </button></td>';
    html+='</tr>';
    $(this).closest("tr").before(html);
  })
  $(document).off("click", ".btn_remove_upazila");
  $(document).on("click",'.btn_remove_upazila',function(){
    let row_type_id=$(this).closest('.row_type').attr('id');
    $(this).closest('tr').remove();
    calculateTotalMarketSize(row_type_id);
  });
  $(document).off("input", ".input_upazila_market_size");
  $(document).on("input",'.input_upazila_market_size',function(){
    let row_type_id=$(this).closest('.row_type').attr('id');
    calculateTotalMarketSize(row_type_id);
  });
  $(document).off("click", ".btn_add_more_competitor_size");
  $(document).on("click",'.btn_add_more_competitor_size',function()
  {
    let row_type_id=$(this).closest('.row_type').attr('id');
    let crop_type_id=row_type_id.substring(5);//after type_
    let variety_id=$("#"+row_type_id+" .sel_competitor_variety").val();
    let variety_name="Other";
    let competitor_name="Other";
    if(variety_id>0){
      //set variety_name competitor_name
    }

    let html='<tr>';
    html+=('<td>'+competitor_name+'</td>');
    html+=('<td>'+variety_name+'</td>');
    html+=('<td><input type="text" class="form-control float_positive input_competitor_market_size" /></td>');
    html+=('<td><input type="text" class="form-control input_competitor_sales_reason" /></td>');
    html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_competitor"><i class="bi bi-dash-circle"></i> Remove </button></td>';
    html+='</tr>';
    $(this).closest("tr").before(html);
  })
  $(document).off("click", ".btn_remove_competitor");
  $(document).on("click",'.btn_remove_competitor',function(){
    let row_type_id=$(this).closest('.row_type').attr('id');
    $(this).closest('tr').remove();
    calculateTotalMarketSize(row_type_id);
  });
  $(document).off("input", ".input_competitor_market_size");
  $(document).on("input",'.input_competitor_market_size',function(){
    let row_type_id=$(this).closest('.row_type').attr('id');
    calculateTotalMarketSize(row_type_id);
  });
});
const save=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      if(save_and_new){
        if(item.id>0){
          router.push(taskData.api_url+"/add")
        }
        else{
          setInputFields();
        }
      }
      else{
        router.push(taskData.api_url)
      }
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}
const getItem=async ()=>{
  await axios.get(taskData.api_url+'/'+taskData.analysis_year_id+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.data=res.data.data;
      item.location_upazilas=res.data.location_upazilas;
      item.location_unions=res.data.location_unions;
      let rows=[];
      let prev_crop_name="";
      for(let i=0;i<taskData.crop_types.length;i++){
        let crop_type=taskData.crop_types[i];
        let row={};
        row['id']=crop_type['id'];
        if(prev_crop_name!=crop_type['crop_name']){
          row['crop_name']=crop_type['crop_name'];
          prev_crop_name=crop_type['crop_name'];
        }
        else{
          row['crop_name']='';
        }
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
item.id=route.params['item_id']?route.params['item_id']:0;
for(let i=0;i<taskData.location_districts.length;i++){
  if(taskData.location_districts[i].id==item.id){
    item.name=taskData.location_districts[i].name;
  }
}
if(item.id>0){
  if(!(taskData.permissions.action_2)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    getItem();
  }
}
else{
  if(!(taskData.permissions.action_1)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    setInputFields();
    item.exists=true;
  }
}
const calculateTotalMarketSize=(typeId)=>{
  let narketSizeTotal=0;
  $('#'+typeId+" .input_upazila_market_size").each( function (){
    narketSizeTotal+=(+$(this).val());
  });
  let marketSizeCompetitor=0;

  $('#'+typeId+" .input_competitor_market_size").each( function (){
    marketSizeCompetitor+=(+$(this).val());
  });
  $('#'+typeId+" .col_market_size_total").text(narketSizeTotal.toFixed(3));
  $('#'+typeId+" .col_market_size_arm").text((narketSizeTotal-marketSizeCompetitor).toFixed(3));

}
</script>