<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" id="pending-delivery-tab" data-toggle="tab" href="#pending-sowing" role="tab" aria-controls="home" aria-selected="true">Pending Sowing List</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="delivered-tab" data-toggle="tab" href="#sowed" role="tab" aria-controls="profile" aria-selected="false">Sowed List</a>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane show active" id="pending-sowing" role="tabpanel" aria-labelledby="pending-delivery-tab">
          <div class="card" v-if="Object.keys(taskData.itemsPending).length>0">
            <form id="formSavePending">
              <input type="hidden" name="save_token" :value="new Date().getTime()">
              <div class="card-body">
              <div class="row mb-2" >
                <div class="col-4">
                  <label class="font-weight-bold float-right">Sowing Date <span class="text-danger">*</span></label>
                </div>
                <div class="col-4">
                  <div class="input-group" >
                    <input type="date" class="form-control" name="sowing_date" value=""/>
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
                            <th>Delivered Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="variety in crop.varieties">
                            <td class="col-3">
                              <input type="checkbox" :class="'select_crop_'+crop.crop_id" name="variety_ids[]" :value="variety.variety_id"> {{variety.variety_name}}
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
              All variety has been Sowed<br>
              Or No variety has been delivered for this year
            </div>
          </div>
        </div>
        <div class="tab-pane" id="sowed" role="tabpanel" aria-labelledby="delivered-tab">
          <div class="card" v-if="Object.keys(taskData.itemsSowed).length>0">
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
                  <div class="card" v-for="crop in taskData.itemsSowed">
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
                            <th>Sowing Date</th>
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
                            <td>{{variety.sowing_date}}</td>
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
              Nothing was Sowed
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
      $("#pending-sowing input:checkbox").prop('checked', false);
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
const saveDelivered=async ()=>{
  let formData=new FormData(document.getElementById('formSaveDelivered'))
  await axios.post(taskData.api_url+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/save-sowed',formData).then((res)=>{
    if (res.data.error == "") {
      toastFunctions.showSuccessfullySavedMessage();
      taskData.reloadItems();
      $("#sowed input:checkbox").prop('checked', false);
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
</script>