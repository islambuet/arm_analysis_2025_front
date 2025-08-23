<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url+'/'+taskData.analysis_year_id" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> Save and Back</button>
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(true)"><i class="feather icon-plus-square"></i> Save and Edit</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      <div v-if="item.id>0">{{labels.get('label_edit_task')}}({{item.name}})</div>
      <div v-else>{{labels.get('label_new_task')}}</div>
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <form id="formSaveItem">
        <input type="hidden" name="save_token" id="save_token" :value="new Date().getTime()">
        <input type="hidden" name="district_id" :value="item.id">
        <input type="hidden" name="analysis_year_id" :value="taskData.analysis_year_id">
        <table style="width: 2350px;" class="table table-bordered sticky">
          <thead class="table-active">
            <tr>
              <th style="width: 150px;">{{labels.get('label_crop_name')}}</th>
              <th style="width: 200px;">{{labels.get('label_crop_type_name')}}</th>
              <th style="width: 100px;">Total Market Size</th>
              <th style="width: 600px;">Upazila Market Size</th>
              <th style="width: 100px;">Approximate Price</th>
              <th style="width: 200px;">Sowing Period</th>
              <th style="width: 100px;">Arm Market Size</th>
              <th style="width: 800px;">Competitors Variety</th>
              <th style="">Competitors Market Size</th>
            </tr>
          </thead>
          <tbody class="table-striped table-hover">
            <tr class="row_type" v-for="row in item.rows" :key="'row_'+row.id" :id="'type_'+row.id">
              <td class="col_crop_name">{{row.crop_name}}</td>
              <td class="col_crop_type_name">{{row.crop_type_name}}</td>
              <td class="col_market_size_total text-right">{{ item.data[row.id]?item.data[row.id]['market_size_total'].toFixed(3):'0.000' }}</td>
              <td class="col_upazilas_info">
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
                    <tr v-if="item.data[row.id]" v-for="(market_size,upazila_id) in item.data[row.id]['upazila_market_size']">
                      <td>{{ item.location_upazilas[upazila_id]?item.location_upazilas[upazila_id]['name']:"Other" }}</td>
                      <td><input type="text" :name="'items['+row.id+'][upazila_market_size]['+upazila_id+']'" class="form-control float_positive input_upazila_market_size" :value="market_size"></td>
                      <td>
                        <template v-if="item.location_unions[upazila_id]">
                          <div class="form-check form-check-inline" v-for="union in item.location_unions[upazila_id]">
                            <input class="form-check-input" type="checkbox" :name="'items['+row.id+'][union_ids_running][]'" :id="'union_id_type_'+row.id+'_'+union.id" :value="union.id" :checked="(item.data[row.id]['union_ids_running'].includes(','+union.id+','))"/><label class="form-check-label" :for="'union_id_type_'+row.id+'_'+union.id">{{union.name}}</label>
                          </div>
                        </template>
                      </td>
                      <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_upazila"><i class="bi bi-dash-circle"></i> Remove </button></td>
                    </tr>
                  <tr>
                    <td colspan="3">
                      <div class="input-group" >
                        <select class="form-control sel_upazila">
                          <option v-for="upazila in item.location_upazilas_ordered" :value="upazila.id">
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
              <td class="col_price_approximate"><input type="text" :name="'items['+row.id+'][price_approximate]'" class="form-control float_positive" :value="item.data[row.id]?item.data[row.id]['price_approximate']:'0'"></td>
              <td class="col_sowing_periods">
                <div v-for="i in 12" class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" :id="'sowing_periods_'+row.id+'_'+i" :name="'items['+row.id+'][sowing_periods][]'" :value="i" :checked="item.data[row.id]?(item.data[row.id]['sowing_periods'].includes(','+i+',')):false"/><label class="form-check-label" :for="'sowing_periods_'+row.id+'_'+i">{{ labels.get('label_month_short_'+i) }}</label>
                </div>
              </td>
              <td class="col_market_size_arm text-right">{{ item.data[row.id]?item.data[row.id]['market_size_arm'].toFixed(3):'0.000' }}</td>
              <td class="col_competitors_info">
                <table class="table table-bordered">
                  <thead>
                  <tr>
                    <th style="width: 150px">Company</th>
                    <th style="width: 150px">Variety</th>
                    <th style="width: 150px">Market Size</th>
                    <th>Reason for the Sales</th>
                    <th style="width: 110px"></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="item.data[row.id]" v-for="(market_size,variety_id) in item.data[row.id]['competitor_market_size']">
                    <td>{{ (item.varieties_competitor[row.id] && item.varieties_competitor[row.id][variety_id])?item.varieties_competitor[row.id][variety_id]['competitor_name']:"Other" }}</td>
                    <td>{{ (item.varieties_competitor[row.id] && item.varieties_competitor[row.id][variety_id])?item.varieties_competitor[row.id][variety_id]['name']:"Other" }}</td>
                    <td><input type="text" :name="'items['+row.id+'][competitor_market_size]['+variety_id+']'" class="form-control float_positive input_competitor_market_size" :value="market_size"></td>
                    <td><input type="text" :name="'items['+row.id+'][competitor_sales_reason]['+variety_id+']'" class="form-control input_competitor_sales_reason" :value="item.data[row.id]['competitor_sales_reason'][variety_id]?item.data[row.id]['competitor_sales_reason'][variety_id]:''"></td>
                    <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_upazila"><i class="bi bi-dash-circle"></i> Remove </button></td>
                  </tr>
                  <tr>
                    <td colspan="4">
                      <div class="input-group" >
                        <select class="form-control sel_competitor_variety">
                          <option v-if="item.varieties_competitor_ordered[row.id]" v-for="variety in item.varieties_competitor_ordered[row.id]" :value="variety.id">
                            {{variety.competitor_name+'-'+ variety.name}}
                          </option>
                          <option value="0">Other</option>
                        </select>
                      </div>
                    </td>
                    <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_competitor_size"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                  </tr>
                  </tbody>
                </table>
              </td>
              <td class="col_market_size_competitors text-right">{{ item.data[row.id]?item.data[row.id]['market_size_competitor'].toFixed(3):'0.000' }}</td>
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
  data:{},
  location_upazilas:{},
  location_upazilas_ordered: {},
  location_unions: {},
  varieties_competitor: {},
  varieties_competitor_ordered: {},

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
      upazila_name=item.location_upazilas[upazila_id].name;
      if(item.location_unions[upazila_id]){
        unions=item.location_unions[upazila_id];
      }
    }

    let html='<tr>';
    html+=('<td>'+upazila_name+'</td>');
    html+=('<td><input type="text" name="items['+crop_type_id+'][upazila_market_size]['+upazila_id+']" class="form-control float_positive input_upazila_market_size" /></td>');
    html+='<td>';
    for(let i=0;i<unions.length;i++){
      let union=unions[i];
      html+=('<div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="items['+crop_type_id+'][union_ids_running][]" id="union_id_'+(row_type_id+"_"+union.id)+'" value="'+union.id+'"/><label class="form-check-label" for="union_id_'+(row_type_id+"_"+union.id)+'">'+union.name+'</label></div>');
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
      variety_name=item.varieties_competitor[crop_type_id][variety_id]['name'];
      competitor_name=item.varieties_competitor[crop_type_id][variety_id]['competitor_name'];
    }

    let html='<tr>';
    html+=('<td>'+competitor_name+'</td>');
    html+=('<td>'+variety_name+'</td>');
    html+=('<td><input type="text" name="items['+crop_type_id+'][competitor_market_size]['+variety_id+']" class="form-control float_positive input_competitor_market_size" /></td>');
    html+=('<td><input type="text" name="items['+crop_type_id+'][competitor_sales_reason]['+variety_id+']" class="form-control input_competitor_sales_reason" /></td>');
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
        $('#save_token').val(new Date().getTime());
      }
      else{
        router.push(taskData.api_url+'/'+taskData.analysis_year_id)
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
      item.location_upazilas_ordered=res.data.location_upazilas_ordered;
      item.location_unions=res.data.location_unions;
      item.varieties_competitor=res.data.varieties_competitor;
      item.varieties_competitor_ordered=res.data.varieties_competitor_ordered;

      let rows=[];
      //let prev_crop_name="";
      for(let i=0;i<taskData.crop_types.length;i++){
        let crop_type=taskData.crop_types[i];
        let row={};
        row['id']=crop_type['id'];
        row['crop_name']=crop_type['crop_name'];
        // if(prev_crop_name!=crop_type['crop_name']){
        //   row['crop_name']=crop_type['crop_name'];
        //   prev_crop_name=crop_type['crop_name'];
        // }
        // else{
        //   row['crop_name']='';
        // }
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
  $('#'+typeId+" .col_market_size_competitors").text(marketSizeCompetitor.toFixed(3));
  $('#'+typeId+" .col_market_size_arm").text((narketSizeTotal-marketSizeCompetitor).toFixed(3));


}
</script>

<style scoped>

/* To show borders. overwrite bootstarp css */
table.sticky {
  border-collapse: separate;
  border-spacing: 0;
}
table.sticky >thead th{
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 1030;
  background:#f5f5f5;
  border-width: 1px;
}
table.sticky > thead > tr > th:nth-child(1){
  left: 0;
  z-index: 1040;
}
table.sticky > thead > tr > th:nth-child(2){
  left: 150px;
  z-index: 1040;
}

table.sticky > tbody > tr > td:nth-child(1){
  position: sticky;
  position: -webkit-sticky;
  left: 0;
  z-index: 1020;
  background:#f5f5f5;
  border-width: 1px;
}

table.sticky > tbody > tr > td:nth-child(2){
  position: sticky;
  position: -webkit-sticky;
  left: 150px;
  z-index: 1020;
  background:#f5f5f5;
  border-width: 1px;
}
</style>