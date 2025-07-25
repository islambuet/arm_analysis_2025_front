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
    <div class="card-body">
      <form id="formSaveItem">
        <input type="hidden" name="save_token" id="save_token" :value="new Date().getTime()">
        <input type="hidden" name="item[distributor_id]" :value="item.id">
        <input type="hidden" name="item[fiscal_year]" :value="current_fiscal_year">
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_fiscal_year')}}</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{current_fiscal_year+'-'+(current_fiscal_year+1)}} </label>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_crop_name')}} <span class="text-danger">*</span></label>
          </div>
          <div class="col-lg-4 col-8">
            <div class="input-group" >
              <select id="crop_id" class="form-control">
                <option value="">{{labels.get('label_select')}}</option>
                <option v-for="row in taskData.crops" :value="row.id">
                  {{row.name}}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_crop_type_name')}} <span class="text-danger">*</span></label>
          </div>
          <div class="col-lg-4 col-8">
            <div class="input-group" >
              <select id="type_id" name="item[type_id]" class="form-control">
                <option value="">{{labels.get('label_select')}}</option>
                <option v-for="row in item.inputFields.crop_types" :value="row.id">
                  {{row.name}}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div v-if="item.exists">
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_month_start')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <select id="type_id" name="item[month_start]" class="form-control">
                <option value="">{{labels.get('label_select')}}</option>
                <option v-for="i in 12" :value="i">
                  {{labels.get('label_month_short_'+i)}}
                </option>
              </select>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_month_end')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <select id="type_id" name="item[month_start]" class="form-control">
                <option value="">{{labels.get('label_select')}}</option>
                <option v-for="i in 12" :value="i">
                  {{labels.get('label_month_short_'+i)}}
                </option>
              </select>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_pocket_market')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <input type="text" name="item[pocket_market]" class="form-control">
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">

            </div>
            <div class="col-lg-4 col-8">
              <table class="table table-bordered">
                <thead>
                <tr>
                  <th>Major Competitor Variety</th>
                  <th>Proposed ARM Variety</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in item.inputFields.varieties_competitor">
                  <td >
                    <input type="checkbox"> {{row.name}}
                  </td>
                  <td>
                    <template v-for="v_arm in item.inputFields.varieties_arm">
                      <input type="checkbox"> {{v_arm.name}} &nbsp;<br>
                    </template>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_distributor_recommendation')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <textarea class="form-control"></textarea>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_manager_recommendation')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <textarea class="form-control"></textarea>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_manager_suggestion')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <textarea class="form-control"></textarea>
            </div>
          </div>
          <table class="table table-bordered">
            <thead>
            <tr>
              <th></th>
              <th v-for="row in item.inputFields.varieties_arm">
                {{row.name}}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Sales FY-{{(current_fiscal_year-2)+'-'+(current_fiscal_year-1)}}</td>
              <td v-for="row in item.inputFields.varieties_arm">
                -
              </td>
            </tr>
            <tr>
              <td>Sales FY-{{(current_fiscal_year-1)+'-'+(current_fiscal_year)}}</td>
              <td v-for="row in item.inputFields.varieties_arm">
                -
              </td>
            </tr>
            <tr>
              <td>Forecast FY-{{current_fiscal_year+'-'+(current_fiscal_year+1)}}</td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td :colspan="item.inputFields.varieties_arm.length+1" class="text-center"><strong>Sales Activities For FY-{{current_fiscal_year+'-'+(current_fiscal_year+1)}}</strong></td>
            </tr>
            <tr>
              <td># of Dealer Meeting </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Farmer Meeting </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Demo </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Result Sharing </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Field Day </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td :colspan="item.inputFields.varieties_arm.length+1" class="text-center"><strong>Sales Activities For FY-{{(current_fiscal_year+1)+'-'+(current_fiscal_year+2)}}</strong></td>
            </tr>
            <tr>
              <td># of Dealer Meeting </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Farmer Meeting </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Demo </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Result Sharing </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Field Day </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td :colspan="item.inputFields.varieties_arm.length+1" class="text-center"><strong>Sales Activities For FY-{{(current_fiscal_year+2)+'-'+(current_fiscal_year+3)}}</strong></td>
            </tr>
            <tr>
              <td># of Dealer Meeting </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Farmer Meeting </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Demo </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Result Sharing </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
              </td>
            </tr>
            <tr>
              <td># of Field Day </td>
              <td v-for="row in item.inputFields.varieties_arm">
                <input type="text" class="form-control float_positive">
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
let current_month=new Date().getMonth();
let current_fiscal_year= (globalVariables.current_year);
if(current_month<globalVariables.fiscal_year_starting_month){
  current_fiscal_year--;
}
let item=reactive({
  id:0,
  exists:false,
  inputFields:{crop_types:[],varieties_arm:[],varieties_competitor:[]},
  data:{
    id:0,
    month_start:3,
    part_id:'',
    area_id:'',
    territory_id:'',
    distributor_id:'',
    crop_id:'',
    crop_type_id:'',
    variety_id:'',
    year:'',
    quantity:'',
    unit_price:'',
    amount:'',
    status:'Active',
  }
})

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
  let formData=new FormData(document.getElementById('formSaveItem'))
  item.exists=false;
  if($('#type_id').val()>0){
    await axios.post(taskData.api_url+'/get-item/'+ item.id,formData).then((res)=>{
      if (res.data.error == "") {
        item.data=res.data.item;
        item.exists=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }

}
  item.id=route.params['item_id']?route.params['item_id']:0;

$(document).ready(function()
{

  $(document).off("change", "#crop_id");
  $(document).on("change",'#crop_id',async function()
  {
    let crop_id=$(this).val();
    item.inputFields['crop_types']=taskData.crop_types.filter((temp)=>{ if(temp.crop_id==crop_id){temp.value=temp.id.toString();temp.label=temp.name;return true}})
  })
  $(document).off("change", "#type_id");
  $(document).on("change",'#type_id',async function()
  {
    let type_id=$(this).val();
    item.inputFields['varieties_arm']=taskData.varieties.filter((temp)=>{ if(temp.crop_type_id==type_id && temp.whose=='ARM'){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    item.inputFields['varieties_competitor']=taskData.varieties.filter((temp)=>{ if(temp.crop_type_id==type_id && temp.whose=='Competitor'){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    getItem();
  })
});
</script>