<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> Save and Back</button>
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(true)"><i class="feather icon-plus-square"></i> Save and Edit</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}( {{item.name}} )
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <form id="formSaveItem">
        <input type="hidden" name="save_token" id="save_token" :value="new Date().getTime()">
        <input type="hidden" name="id" :value="item.id">
        <table style="width: 1600px;" class="table table-bordered sticky">
          <thead class="table-active">
            <tr>
              <th style="width: 150px;">{{labels.get('label_crop_name')}}</th>
              <th style="width: 200px;">{{labels.get('label_crop_type_name')}}</th>
              <th style="width: 100px;">Total Market Size</th>
              <th style="width: 400px;">Pocket Market</th>
              <th style="">Competitors Variety</th>
            </tr>
          </thead>
          <tbody class="table-striped table-hover">
            <tr class="row_type" v-for="row in item.rows" :key="'row_'+row.id" :id="'type_'+row.id">
              <td class="col_crop_name">{{row.crop_name}}</td>
              <td class="col_crop_type_name">{{row.crop_type_name}}</td>
              <td class="col_market_size_total">{{item.market_size_territory[row.id]?item.market_size_territory[row.id]['market_size_total']:''}}</td>
              <td class="col_pocket_market">
                <table class="table table-bordered">
                  <thead>
                  <tr>
                    <th style="width: 150px">Upazilla</th>
                    <th style="">Union</th>
                  </tr>
                  </thead>
                  <tbody>
                    <template v-if="item.data[row.id]" v-for="(union_ids,upazila_id) in item.data[row.id]['pocket_market']" >
                      <tr>
                        <td>{{item.location_upazilas[upazila_id]?item.location_upazilas[upazila_id]['name']:'NF'}}</td>
                        <td>
                          <template v-for="union_id in union_ids">
                            {{item.location_unions[union_id]?item.location_unions[union_id]['name']:'NF'}}<br>
                          </template>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </td>
              <td class="col_competitors_info">
                <template v-if="item.data[row.id] " v-for="(competitor_varieties_info,competitor_variety_id) in item.data[row.id]['competitor_varieties']">
                  <div class="row">
                    <div class="col-12">
                      <div><strong>Company:</strong>{{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][competitor_variety_id])?taskData.varieties_competitor_typewise[row.id][competitor_variety_id]['competitor_name']:"Other" }}  </div>
                      <div><strong>Variety: </strong>{{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][competitor_variety_id])?taskData.varieties_competitor_typewise[row.id][competitor_variety_id]['name']:"Other" }}</div>
                      <div><strong>Reason: </strong>{{item.data[row.id]['competitor_varieties'][competitor_variety_id]?item.data[row.id]['competitor_varieties'][competitor_variety_id]['recommended_reason']:''}}</div>
                      <table class="table table-bordered">
                        <thead>
                        <tr>
                          <th style="width: 150px">Variety</th>
                          <th>Recommendation</th>
                          <template v-for="m in 12">
                            <th style="width: 100px" v-if="item.season['month_'+m]">{{ labels.get('label_month_short_'+m) }}</th>
                          </template>
                          <th style="width: 150px">Total Qtn</th>
                          <th style="width: 110px"></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-if="item.data[row.id]['arm_varieties'] && item.data[row.id]['arm_varieties'][competitor_variety_id]" v-for="(arm_varieties_info,arm_variety_id) in item.data[row.id]['arm_varieties'][competitor_variety_id]">
                          <td>{{ (taskData.varieties_arm_typewise[row.id] && taskData.varieties_arm_typewise[row.id][arm_variety_id])?taskData.varieties_arm_typewise[row.id][arm_variety_id]['name']:"NF" }}</td>
                          <td><input type="text" :name="'items['+[row.id]+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][suggested_reason]'" :value="arm_varieties_info['suggested_reason']" class="form-control" /></td>
                          <template v-for="m in 12">
                            <td v-if="item.season['month_'+m]">
                              <input type="text" :name="'items['+[row.id]+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][quantity_month_'+m+']'" :value="arm_varieties_info['quantity_month_'+m]" class="form-control float_positive quantity_month" @input="sumMonthQuantity($event)" />
                            </td>
                          </template>

                          <td><input type="text" :name="'items['+[row.id]+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][quantity_total]'" readonly :value="arm_varieties_info['quantity_total']" class="form-control float_positive quantity_total" /></td>
                          <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_arm_variety"><i class="bi bi-dash-circle"></i> Remove </button></td>

                        </tr>
                          <tr>
                            <td :colspan="item.num_months+3">
                              <div class="input-group" >
                                <select class="form-control sel_arm_variety" :id="'sel_arm_variety_'+competitor_variety_id">
                                  <option v-if="taskData.varieties_arm_typewise_ordered[row.id]" v-for="variety in taskData.varieties_arm_typewise_ordered[row.id]" :value="variety.id">
                                    {{variety.name}}
                                  </option>
                                </select>
                              </div>
                            </td>
                            <td><button type="button" :data-competitor-variety-id="competitor_variety_id" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_arm_variety"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </template>
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
  id:'',
  name:'',
  exists:false,
  location_upazilas:{},
  location_upazilas_ordered: {},
  location_unions: {},
  market_size_territory:{},
  season:{},
  num_months:0,
  data:{},
  rows:[]
})
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
  $(document).off("click", ".btn_add_more_arm_variety");
  $(document).on("click",'.btn_add_more_arm_variety',function()
  {
    let row_type_id=$(this).closest('.row_type').attr('id');
    let crop_type_id=row_type_id.substring(5);//after type_
    let competitor_variety_id=$(this).attr('data-competitor-variety-id')
    let arm_variety_id=$("#sel_arm_variety_"+competitor_variety_id).val();
    let variety_name="Other";
    if(arm_variety_id>0){
      variety_name=taskData.varieties_arm_typewise[crop_type_id][arm_variety_id]['name'];
    }

    let html='<tr>';
    html+=('<td>'+variety_name+'</td>');
    html+=('<td><input type="text" name="items['+crop_type_id+'][arm_varieties]['+competitor_variety_id+']['+arm_variety_id+'][suggested_reason]" class="form-control" /></td>');
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
        router.push(taskData.api_url)
      }
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}
const getItem=async ()=>{
  await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.location_upazilas=res.data.location_upazilas;
      item.location_upazilas_ordered=res.data.location_upazilas_ordered;
      item.location_unions=res.data.location_unions;
      item.market_size_territory=res.data.market_size_territory;
      item.data=res.data.data;
      let rows=[];
      for(let i=0;i<taskData.crop_types.length;i++){
        let crop_type=taskData.crop_types[i];
        if(item.data[crop_type['id']])
        {
          let row={};
          row['id']=crop_type['id'];
          row['crop_name']=crop_type['crop_name'];
          row['crop_type_name']=crop_type['name'];
          rows.push(row);
        }

      }
      item.rows=rows;
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
item.id=route.params['item_id']?route.params['item_id']:'';
if(item.id){
  if(!(taskData.permissions.action_2)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    let name=item.id.substring(0,4)+' -- '
    let season_id=item.id.substring(5,item.id.lastIndexOf('_'));
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
    name+=' -- '
    let territory_id=item.id.substring(item.id.lastIndexOf('_')+1);
    for(let i=0;i<taskData.location_territories.length;i++){
      if(taskData.location_territories[i].id==territory_id){
        name+=taskData.location_territories[i].name;
      }
    }
    item.name=name;
    getItem();
  }
}
else{
  toastFunctions.showAccessDenyMessage();
}

</script>