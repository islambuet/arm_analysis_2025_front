<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(item.columns,[],'Upload Format(Distributors Sales).csv')"><i class="feather icon-download"></i> {{labels.get('label_upload_format_csv')}}</button>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="saveItems(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2">
    <div class="card-header d-print-none">
      Upload {{labels.get('label_task')}}
    </div>
    <div class="card-body">
      <div class="row mb-2">
        <div class="col-4">
          <label class="font-weight-bold float-right">{{labels.get('label_select_csv_data_file')}} <span class="text-danger">*</span></label>
        </div>
        <div class="col-lg-4 col-8">
          <div class="input-group input-group-sm">
            <div class="input-group-prepend">
              <label class="btn btn-sm bg-gradient-primary" style="cursor: pointer;">
                <input id="file_upload_items" type="file" accept=".csv" class="d-none">
                <i class="bi bi-upload"></i> {{labels.get('label_upload_file')}}
              </label>
            </div>
            <label class="form-control custom-file-name"></label>
            <div class="input-group-append clear_file" @click="resetFile('file_upload_items')">
              <label class="btn btn-sm bg-gradient-info" style="cursor: pointer;">clear</label>
            </div>
          </div>
        </div>
      </div>
      <form id="formSaveItems" v-if="item.show_report">
        <input type="hidden" name="save_token" id="save_token" :value="new Date().getTime()">
        <input type="hidden" id="file_name" :value="item.file_name">
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">File Name</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{item.file_name}} </label>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">Total Records</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{item.data.length}}</label> <small>(If more than 700 discuss with admin)</small>
          </div>
        </div>
        <table class="table table-bordered">
          <thead class="table-active">
          <tr>
            <template v-for="(column,key) in item.columns.all">
              <th class="position-relative align-middle"><div class=" text-center " style="width:calc(100% - 33px);margin-left:17px">{{ column.label }}</div></th>
            </template>
          </tr>
          </thead>
          <tbody class="table-striped table-hover">
          <tr v-for="(datum,index) in item.data">
            <template v-for="(column,key) in item.columns.all">
              <td>
                {{ datum[key] }}
                <template v-if="!datum['status'] && item.columns.hidden.indexOf(key)<0">
                  <input type="hidden" :name="'items['+index+']['+key+']'" :value="datum[key]">
                </template>
              </td>
            </template>
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
  exists:false,
  show_report:false,
  file_name:'',
  columns:{all:{},hidden:['sl_num','status']},
  data:[]
})
let distributors_object={};
for(let i in taskData.distributors){
  distributors_object[taskData.distributors[i]['id']]=taskData.distributors[i];
}
let pack_sizes_object={};
for(let i in taskData.pack_sizes){
  pack_sizes_object[taskData.pack_sizes[i]['id']]=taskData.pack_sizes[i];
}
const setColumns=()=>{
  let columns={}
  let key='sl_num';
  columns[key]={label: 'Serial'}
  key='status';
  columns[key]={label: labels.get('label_'+key)}
  key='sales_at';
  columns[key]={label: 'Date'}
  key='invoice_no';
  columns[key]={label: labels.get('label_'+key)}
  key='distributor_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='pack_size_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='quantity';
  columns[key]={label: labels.get('label_'+key)}
  key='unit_price';
  columns[key]={label: labels.get('label_'+key)}
  key='amount';
  columns[key]={label: labels.get('label_'+key)}
  item.columns.all=columns
}
setColumns();
const resetFile=(fileId)=>{
  $('#'+fileId).val('').trigger('change');//change trigger required for active
}
const saveItems=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItems'))
  await axios.post(taskData.api_url+'/save-items',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      router.push(taskData.api_url)
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}

$(document).ready(function()
{
  $(document).off("change", "#file_upload_items");
  $(document).on("change",'#file_upload_items',async function()
  {
    item.exists=false;
    item.show_report=false;
    if(this.files && this.files[0])
    {
      let file=this.files[0];
      if(file.name.endsWith(".csv")){
        const reader = new FileReader();
        reader.onload = function(e) {
          let success=true;
          let data=[]
          let rows=e.target.result.split('\n');
          let num_cols=Object.keys(item.columns.all).length-item.columns.hidden.length;
          for(let i=1;i<rows.length;i++){
            let cols=rows[i].split(',')
            let datum={}
            datum['sl_num']=i;
            if(cols.length==num_cols){
              datum['status']='';
              datum['sales_at']=cols[0]
              datum['invoice_no']=cols[1]
              datum['distributor_id']=cols[2]
              datum['pack_size_id']=cols[3]
              datum['quantity']=cols[4]
              datum['unit_price']=cols[5]
              datum['amount']=cols[6]
              if(!datum['sales_at'])   {
                datum['status']='Date';
              }
              else if(!datum['invoice_no'])   {
                datum['status']=labels.get('label_invoice_no');
              }
              else if(!distributors_object[datum['distributor_id']])   {
                datum['status']=labels.get('label_distributor_id');
              }
              else if(!pack_sizes_object[datum['pack_size_id']])   {
                datum['status']=labels.get('label_pack_size_id');
              }
              else if(!datum['quantity'])   {
                datum['status']=labels.get('label_quantity');
              }
              else if(!datum['unit_price'])   {
                datum['status']=labels.get('label_unit_price');
              }
              else if(!datum['amount'])   {
                datum['status']=labels.get('label_amount');
              }

              if(!datum['status']){
                data.push(datum);
              }
              else{
                success=false;
                data.unshift(datum)
              }
            }
            else{
              if(i!=rows.length-1){
                datum['status']='Column mismatch';
                datum['sales_at']='';
                datum['invoice_no']='';
                datum['distributor_id']='';
                datum['pack_size_id']='';
                datum['quantity']='';
                datum['unit_price']='';
                datum['amount']='';
                success=false;
                data.unshift(datum)
              }
            }
          }
          item.data=data;
          item.file_name=file.name;
          item.show_report=true;
          if(data.length>0 && success && data.length<700){
            item.exists=true;
          }
        };
        reader.readAsText(file);
      }
      else{
        console.log("not csv file")
      }

    }
  })
});

</script>