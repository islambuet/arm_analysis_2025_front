<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" id="pending-delivery-tab" data-toggle="tab" href="#pending-delivery" role="tab" aria-controls="home" aria-selected="true">Pending Delivery List</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="delivered-tab" data-toggle="tab" href="#delivered" role="tab" aria-controls="profile" aria-selected="false">Delivered List</a>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane show active" id="pending-delivery" role="tabpanel" aria-labelledby="pending-delivery-tab">
          <div class="card" v-if="Object.keys(taskData.itemsPending).length>0">
            <form id="formSavePending">
              <input type="hidden" name="save_token" :value="new Date().getTime()">
              <div class="card-body">
              <div class="row mb-2" >
                <div class="col-4">
                  <label class="font-weight-bold float-right">Delivery Date <span class="text-danger">*</span></label>
                </div>
                <div class="col-4">
                  <div class="input-group" >
                    <input type="date" class="form-control" name="delivered_date" value=""/>
                  </div>
                </div>
                <div class="col-4">
                  <button  type="button" class="btn btn-sm bg-gradient-primary" @click="savePending"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
                </div>
              </div>
              <div class="accordion mb-2">
                <div class="card" v-for="crop in taskData.itemsPending">
                  <div class="card-header p-1">
                    <a class="btn btn-sm" data-toggle="collapse" :href="'#accordion_header_'+crop.crop_id">{{crop.crop_name}}</a>
                  </div>
                  <div :id="'accordion_header_'+crop.crop_id" class="collapse">
                    <div class="card-body" style='overflow-x:auto'>
                      <table class="table table-sm table-bordered">
                        <thead class="table-active">
                          <tr>
                            <th><input type="checkbox" :data-type="'select_crop_'+crop.crop_id" class="select_all">Variety Name</th>
                            <th>RND code</th>
                            <th>Replica</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="variety in crop.varieties">
                            <td class="col-3">
                              <input type="checkbox" :class="'select_crop_'+crop.crop_id" :name="'varieties['+variety.variety_id+'][variety_id]'" :value="variety.variety_id"> {{variety.variety_name}}
                              <input type="hidden" :name="'varieties['+variety.variety_id+'][rnd_ordering]'" :value="variety.rnd_ordering">
                              <input type="hidden" :name="'varieties['+variety.variety_id+'][rnd_code]'" :value="variety.rnd_code">
                            </td>
                            <td>{{variety.rnd_code}}</td>
                            <td>
                              <select :name="'varieties['+variety.variety_id+'][replica]'" class="form-control">
                                <option value="Yes" :selected="variety.replica=='Yes'">Yes</option>
                                <option value="No" :selected="variety.replica=='No'">No</option>
                              </select>
                            </td>
                          </tr>

                        </tbody>
                      </table>

                    </div>
                  </div>
                </div>
              </div>
            </div>
            </form>
          </div>
          <div class="card" v-else>
            <div class="card-body">
              All variety has been delivered<br>
              Or No variety Configured for this year
            </div>
          </div>
        </div>
        <div class="tab-pane" id="delivered" role="tabpanel" aria-labelledby="delivered-tab">
          <div class="card" v-if="Object.keys(taskData.itemsDelivered).length>0">
            <form id="formSaveDelivered">
              <input type="hidden" name="save_token" :value="new Date().getTime()">
              <div class="card-body">
                <div class="row mb-2" >
                  <div class="col-4">
                  </div>
                  <div class="col-4">
                    <button  type="button" class="btn btn-sm bg-gradient-primary" @click="saveDelivered"><i class="feather icon-save"></i> Save (Return to Pending List)</button>
                  </div>
                  <div class="col-4">
                  </div>
                </div>
                <div class="accordion_delivered mb-2">
                  <div class="card" v-for="crop in taskData.itemsDelivered">
                    <div class="card-header p-1">
                      <a class="btn btn-sm" data-toggle="collapse" :href="'#accordion_header_delivered_'+crop.crop_id">{{crop.crop_name}}</a>
                    </div>
                    <div :id="'accordion_header_delivered_'+crop.crop_id" class="collapse">
                      <div class="card-body" style='overflow-x:auto'>
                        <table class="table table-sm table-bordered">
                          <thead class="table-active">
                          <tr>
                            <th><input type="checkbox" :data-type="'select_crop_delivered_'+crop.crop_id" class="select_all">Variety Name</th>
                            <th>RND code</th>
                            <th>Replica</th>
                            <th>Delivered Date</th>
                          </tr>
                          </thead>
                          <tbody>
                          <tr v-for="variety in crop.varieties">
                            <td class="col-3">
                              <input type="checkbox" :class="'select_crop_delivered_'+crop.crop_id" name="variety_ids[]" :value="variety.variety_id"> {{variety.variety_name}}
                            </td>
                            <td>{{variety.rnd_code}}</td>
                            <td>{{variety.replica}}</td>
                            <td>{{variety.delivered_date}}</td>
                          </tr>
                          </tbody>
                        </table>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="card" v-else>
            <div class="card-body">
              Nothing was delivered
            </div>
          </div>
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
import {inject, reactive} from "vue";
import axios from "axios";
import InputTemplate from '@/components/InputTemplate.vue';
import {useRoute} from "vue-router/dist/vue-router";
import DetailTemplate from '@/components/DetailTemplate.vue';


const route =useRoute()
const router =useRouter()
let taskData = inject('taskData')
let item=reactive({
  variety_id:0,
  exists:false,
  inputFields:{},
  detailFields:{},
  data:{

  }
})
const savePending=async ()=>{
  let formData=new FormData(document.getElementById('formSavePending'))
  await axios.post(taskData.api_url+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/save-pending',formData).then((res)=>{
    if (res.data.error == "") {
      toastFunctions.showSuccessfullySavedMessage();
      taskData.reloadItems();
      $("#pending-delivery input:checkbox").prop('checked', false);
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
const saveDelivered=async ()=>{
  let formData=new FormData(document.getElementById('formSaveDelivered'))
  await axios.post(taskData.api_url+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/save-delivered',formData).then((res)=>{
    if (res.data.error == "") {
      toastFunctions.showSuccessfullySavedMessage();
      taskData.reloadItems();
      $("#delivered input:checkbox").prop('checked', false);
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
</script>