<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      <div>{{labels.get('label_details_task')}} ({{item.id}})</div>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-2">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_part_name')}}</label>
            </div>
            <div class="col-8">
              {{item.data.part_name}}
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_area_name')}}</label>
            </div>
            <div class="col-8">
              {{item.data.area_name}}
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_territory_name')}}</label>
            </div>
            <div class="col-8">
              {{item.data.territory_name}}
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_upazila_id')}}</label>
            </div>
            <div class="col-8">
              {{item.data.upazila_name}}-{{item.data.district_name}}
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-2">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_crop_name')}}</label>
            </div>
            <div class="col-8">
              {{item.data.crop_name}}
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_crop_type_name')}}</label>
            </div>
            <div class="col-8">
              {{item.data.crop_type_name}}
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-2"><label class="font-weight-bold float-right">Variety</label></div>
        <div class="col-5">
          {{item.data.variety_name_arm}}
        </div>
        <div class="col-5">
          {{item.data.competitor_name}}-{{item.data.variety_name_competitor}}
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-2"><label class="font-weight-bold float-right">Farmer Name <span class="text-danger">*</span></label></div>
        <div class="col-5">
          {{item.data.farmer_name}}
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-2"><label class="font-weight-bold float-right">Mobile</label></div>
        <div class="col-5">
          {{item.data.mobile_no}}
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-2"><label class="font-weight-bold float-right">Sowing Date</label></div>
        <div class="col-5">
          {{item.data.sowing_date_arm}}
        </div>
        <div class="col-5">
          {{item.data.sowing_date_competitor}}
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-2"><label class="font-weight-bold float-right">Characteristics</label></div>
        <div class="col-5">
          {{item.data.characteristics_arm}}
        </div>
        <div class="col-5">
          {{item.data.characteristics_competitor}}
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-2"><label class="font-weight-bold float-right">Picture</label></div>
        <div class="col-5">

        </div>
        <div class="col-5">
          <button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary"><i class="feather icon-download"></i> {{labels.get('label_download')}}</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>


  import toastFunctions from "@/assets/toastFunctions";
  import labels from '@/labels'
  
  import {useRouter} from "vue-router";
  import {inject, reactive} from "vue";
  import axios from "axios";
  import DetailTemplate from '@/components/DetailTemplate.vue';
  import {useRoute} from "vue-router/dist/vue-router";
  import systemFunctions from "@/assets/systemFunctions";


  const route =useRoute()
  const router =useRouter()
  let taskData = inject('taskData')
  let item=reactive({
    id:0,
    exists:false,
    detailFields:{},
    data:{
    }
  })
  const setDetailFields=async ()=>{

  }
  const getItem=async ()=>{
    await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
      if (res.data.error == "") {
        item.data=res.data.item;
        setDetailFields();
        item.exists=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }
  item.id=route.params['item_id'];
  getItem();

</script>