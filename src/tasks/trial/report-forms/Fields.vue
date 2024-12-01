<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url+'/'+taskData.crop_id" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
    </div>
  </div>
  <div class="card" v-if="item.exists">
    <div class="card-header">
      {{taskData.cropInfo.name}}
      <div>{{item.data.name}}</div>
    </div>
    <div class="card-body" style='overflow-x:auto;'>
      <form id="formSaveItem">
        <input type="hidden" name="save_token" :value="new Date().getTime()">
        <table id="tableReportItems" class="table table-sm table-bordered">
          <thead class="table-active">
          <tr>
            <th>{{labels.get('label_report_column_name')}}</th>
            <th>{{labels.get('label_formula')}}</th>
            <th>{{labels.get('label_equation')}}</th>
            <th>{{labels.get('label_ordering')}}</th>

            <th>{{labels.get('label_action')}}</th>
          </tr>
          </thead>
          <tbody class="table-striped table-hover">
            <tr v-for="(field,index) in item.data.fields">
              <td>{{field.name}}</td>
              <td>{{field.formula}}</td>
              <td>{{field.equation}}</td>
              <td>{{field.ordering}}</td>
              <td>
                <input type="hidden" :name="'items['+index+'][name]'" :value="field.name"/>
                <input type="hidden" :name="'items['+index+'][formula]'" :value="field.formula"/>
                <input type="hidden" :name="'items['+index+'][ordering]'" :value="field.ordering"/>
                <input type="hidden" :name="'items['+index+'][equation]'" :value="field.equation"/>
                <input type="hidden" :name="'items['+index+'][inputId]'" :value="field.inputId"/>
                <button type="button" class="remove_field_button mr-2 mb-2 btn btn-sm bg-gradient-warning"><i class="bi bi-plus-circle"></i> Remove</button>

              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  </div>
  <div class="accordion mb-2" v-if="item.exists">
    <div class="card" v-for="formInputs in taskData.trialFormInputs">
      <div class="card-header p-1">
        <a class="btn btn-sm" data-toggle="collapse" :href="'#trial_form_'+formInputs[0].trial_form_id">{{formInputs[0].trial_form_name}}</a>
      </div>
      <div :id="'trial_form_'+formInputs[0].trial_form_id" class="collapse">
        <div class="card-body" style='overflow-x:auto;'>
          <table class="table table-sm table-bordered">
            <thead class="table-active">
              <tr>
                <th>{{labels.get('label_id')}}</th>
                <th>{{labels.get('label_name')}}</th>
                <th>{{labels.get('label_report_column_name')}}</th>
                <th>{{labels.get('label_formula')}}</th>
                <th>{{labels.get('label_ordering')}}</th>
                <th>{{labels.get('label_action')}}</th>
              </tr>
            </thead>
            <tbody class="table-striped table-hover">
              <tr v-for="formInput in formInputs" :id="'input_'+formInput.id">
                <td class="text-right col_3">{{formInput.id}}</td>
                <td>{{formInput.name}}</td>
                <td>
                  <input type="text" class="form-control name" :value="formInput.name"/>
                </td>
                <td class="col-1">
                  <select class="form-control formula">
                    <option value="none">None</option>
                    <template v-if="formInput.entry_count !=1">
                      <option value="total">Total</option>
                      <option value="average">Average</option>
                    </template>
                  </select>
                </td>
                <td class="text-right col-1">
                  <input type="number" class="form-control ordering" value="99"/>
                </td>

                <td class="col-1">
                  <button type="button" class="btn btn-sm bg-gradient-primary" @click="addField(formInput.id)"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>

import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'

import {useRouter} from "vue-router";
import {inject, onMounted, reactive} from "vue";
import axios from "axios";
import InputTemplate from '@/components/InputTemplate.vue';
import {useRoute} from "vue-router/dist/vue-router";


const route =useRoute()
const router =useRouter()
let taskData = inject('taskData')
let item=reactive({
  id:0,
  exists:false,
  column_count:0,
  data:{
  }
})
const addField=async (inputId)=>{
  item.column_count++;
  console.log(inputId);
  let name=$('#input_'+inputId+" .name").val();
  let formula=$('#input_'+inputId+" .formula").val();
  let ordering=$('#input_'+inputId+" .ordering").val();
  let input_hidden='';
  input_hidden+='<input type="hidden" name="items['+item.column_count+'][name]" value="'+name+'"/>';
  input_hidden+='<input type="hidden" name="items['+item.column_count+'][formula]" value="'+formula+'"/>';
  input_hidden+='<input type="hidden" name="items['+item.column_count+'][ordering]" value="'+ordering+'"/>';
  input_hidden+='<input type="hidden" name="items['+item.column_count+'][inputId]" value="'+inputId+'"/>';
  let row='<tr>';
  row+='<td>'+name+'</td>';
  row+='<td>'+formula+'</td>';
  if(formula=='none'){
    input_hidden+='<input type="hidden" name="items['+item.column_count+'][equation]" value="'+inputId+'"/>';
    row+='<td>'+inputId+'</td>';
  }
  else{
    input_hidden+='<input type="hidden" name="items['+item.column_count+'][equation]" value="'+formula+'('+inputId+')"/>';
    row+='<td>'+formula+'('+inputId+')</td>';
  }
  row+='<td>'+ordering+'</td>';

  row+='<td>'+input_hidden+'<button type="button" class="remove_field_button mr-2 mb-2 btn btn-sm bg-gradient-danger"><i class="bi bi-plus-circle"></i> Remove</button></td>';
  row+='</tr>';
  $('#tableReportItems > tbody:last-child').append(row);

  console.log(name,formula,ordering)
}
$(document).ready(function()
{
  $(document).off("click", ".remove_field_button");
  $(document).on("click",'.remove_field_button',function()
  {
    $(this).closest('tr').remove();
  })
});

const getItem=async ()=>{
  await axios.get(taskData.api_url+'/'+taskData.crop_id+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.data=res.data.item;
      item.column_count=item.data.fields.length;
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
const save=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  await axios.post(taskData.api_url+'/'+taskData.crop_id+'/'+item.id+'/save-fields',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      router.push(taskData.api_url+'/'+taskData.crop_id);
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}

item.id=route.params['form_id']?route.params['form_id']:0;
getItem();

</script>