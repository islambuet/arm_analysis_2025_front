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
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <form id="formSaveItem">
        <input type="hidden" name="save_token" :value="new Date().getTime()">
        <input type="hidden" name="id" :value="item.id">

        <div class="row">
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_part_name')}}</label>
              </div>
              <div class="col-8">
                  <select id="add_part_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_area_name')}}</label>
              </div>
              <div class="col-8">
                  <select id="add_area_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_territory_name')}}</label>
              </div>
              <div class="col-8">
                  <select id="add_territory_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_upazila_id')}}</label>
              </div>
              <div class="col-8">
                  <select id="add_upazila_id" class="form-control" name="item[upazila_id]">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
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
                  <select id="add_crop_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                    <option v-for="row in taskData.crops" :value="row.id">
                      {{row.name}}
                    </option>
                  </select>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_crop_type_name')}}</label>
              </div>
              <div class="col-8">
                  <select id="add_type_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
              </div>
            </div>
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-2"><label class="font-weight-bold float-right">Variety <span class="text-danger">*</span></label></div>
          <div class="col-5">
              <select id="arm_variety_id" class="form-control" name="item[variety_id_arm]">
                <option value="">{{labels.get('label_select')}}</option>
              </select>
          </div>
          <div class="col-5">
              <select id="competitor_variety_id" class="form-control" name="item[variety_id_competitor]">
                <option value="">{{labels.get('label_select')}}</option>
              </select>
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-2"><label class="font-weight-bold float-right">Farmer Name <span class="text-danger">*</span></label></div>
          <div class="col-5">
              <input id="farmer_name" type="text" class="form-control" name="item[farmer_name]">
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-2"><label class="font-weight-bold float-right">Mobile <span class="text-danger">*</span></label></div>
          <div class="col-5">
              <input id="mobile" type="text" class="form-control" name="item[mobile_no]">
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-2"><label class="font-weight-bold float-right">Sowing Date <span class="text-danger">*</span></label></div>
          <div class="col-5">
              <input id="arm_sowing_date" type="date" class="form-control" name="item[sowing_date_arm]">
          </div>
          <div class="col-5">
              <input id="competitor_sowing_date" type="date" class="form-control" name="item[sowing_date_competitor]">
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-2"><label class="font-weight-bold float-right">Picture</label></div>
          <div class="col-5">
              <InputTemplate :inputItems="item.inputFieldsPicturesArm" />
          </div>
          <div class="col-5">
            <InputTemplate :inputItems="item.inputFieldsPicturesCompetitor" />
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-2"><label class="font-weight-bold float-right">Farmer Picture</label></div>
          <div class="col-5">
            <InputTemplate :inputItems="item.inputFieldsPicturesFarmer" />
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-2"><label class="font-weight-bold float-right">Comparison Picture</label></div>
          <div class="col-5">
            <InputTemplate :inputItems="item.inputFieldsPicturesComparison" />
          </div>
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
  inputFieldsPicturesArm:{},
  inputFieldsPicturesCompetitor:{},
  inputFieldsPicturesFarmer:{},
  inputFieldsPicturesComparison:{},
  data:{
    id:0,
    name:'',
    code:'',
    ordering:99,
    replica:'No',
    initial_plants:0,
    status:'Active',
  }
})
const setInputFields=async ()=>{
  let inputFields={}
  let key='picture_arm';
  inputFields[key] = {
    name: 'item[pictures][' +key +']',
    //label: '',
    type:'image',
    default:'',
    mandatory:true,
    more_values:[],
  };
  item.inputFieldsPicturesArm=inputFields;
  inputFields={}
  key='picture_competitor';
  inputFields[key] = {
    name: 'item[pictures][' +key +']',
    //label: '',
    type:'image',
    default:'',
    mandatory:true,
    more_values:[],
  };
  item.inputFieldsPicturesCompetitor=inputFields;

  inputFields={}
  key='picture_farmer';
  inputFields[key] = {
    name: 'item[pictures][' +key +']',
    //label: '',
    type:'image',
    default:'',
    mandatory:true,
    more_values:[],
  };
  item.inputFieldsPicturesFarmer=inputFields;

  inputFields={}
  key='picture_comparison';
  inputFields[key] = {
    name: 'item[pictures][' +key +']',
    //label: '',
    type:'image',
    default:'',
    mandatory:true,
    more_values:[],
  };
  item.inputFieldsPicturesComparison=inputFields;

}
const save=async (save_and_new)=>{
  let saveData=false;
  let fileFormData=await systemFunctions.getImageFormData('formSaveItem');
  //let fileFormData=new FormData(document.getElementById('formSaveItem'))
  if(systemFunctions.isFormDataEmpty(fileFormData)){
    saveData=true;
    toastFunctions.showErrorMessage(labels.get("Profile Image not attached"))
  }
  else{
    for (const key of fileFormData.entries()) {
      console.log(key); // Outputs: "username", then "email"
    }
    fileFormData.set('upload_dir','product_presentation_data_entry')
    await axios.post(globalVariables.baseURLUploadServer+'/upload',fileFormData).then((res)=>{
      if (res.data.error == "") {
        let uploadData = res.data.uploaded_files;
        console.log(uploadData)
        for(let key in uploadData){
          $('#'+key+'_file_input').val(uploadData[key].path)
        }
        saveData=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
    //console.log(fileFormData.entries())
  }
  if(saveData) {
    await systemFunctions.delay(2);//to confirm input is set
    let formData = new FormData(document.getElementById('formSaveItem'))
    await axios.post(taskData.api_url + '/save-item', formData).then((res) => {
      if (res.data.error == "") {
        globalVariables.loadListData = true;
        toastFunctions.showSuccessfullySavedMessage();
        if (save_and_new) {
          if (item.id > 0) {
            router.push(taskData.api_url + "/add")
          } else {
            setInputFields();
          }
        } else {
          router.push(taskData.api_url)
        }
      } else {
        toastFunctions.showResponseError(res.data)
      }
    });
  }

}
const getItem=async ()=>{
  await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.data=res.data.item;
      setInputFields();
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
  item.id=route.params['item_id']?route.params['item_id']:0;
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
$(document).ready(async function() {

  if(taskData.user_locations.part_id>0)
  {
    $('#add_part_id').html('<option value="'+taskData.user_locations.part_id+'">'+taskData.location_parts.find(temp=>temp.id==taskData.user_locations.part_id)?.name+'</option>');
    if(taskData.user_locations.area_id>0)
    {
      $('#add_area_id').html('<option value="'+taskData.user_locations.area_id+'">'+taskData.location_areas.find(temp=>temp.id==taskData.user_locations.area_id)?.name+'</option>');
      if(taskData.user_locations.territory_id>0)
      {
        $('#add_territory_id').html('<option value="'+taskData.user_locations.territory_id+'">'+taskData.location_territories.find(temp=>temp.id==taskData.user_locations.territory_id)?.name+'</option>');
        $('#add_upazila_id').html(taskData.getUpazilaDropdownHtml(taskData.user_locations.territory_id));
      }
      else{
        $('#add_territory_id').html(taskData.getTerritoryDropdownHtml(taskData.user_locations.area_id));
      }
    }
    else{
      $('#add_area_id').html(taskData.getAreaDropdownHtml(taskData.user_locations.part_id));
    }
  }
  else{
    $('#add_part_id').html(taskData.getPartDropdownHtml());
  }
  $(document).off("change", "#add_part_id");
  $(document).on("change", '#add_part_id', async function () {
    let location_id = $(this).val();
    $('#add_upazila_id').html('<option value="">'+labels.get('label_select')+'</option>');
    $('#add_territory_id').html('<option value="">'+labels.get('label_select')+'</option>');
    $('#add_area_id').html(taskData.getAreaDropdownHtml(location_id));
    item.exists = false;
  })
  $(document).off("change", "#add_area_id");
  $(document).on("change", '#add_area_id', async function () {
    let location_id = $(this).val();
    $('#add_upazila_id').html('<option value="">'+labels.get('label_select')+'</option>');
    $('#add_territory_id').html(taskData.getTerritoryDropdownHtml(location_id));
    item.exists = false;
  })
  $(document).off("change", "#add_territory_id");
  $(document).on("change", '#add_territory_id', async function () {
    let location_id = $(this).val();
    $('#add_upazila_id').html(taskData.getUpazilaDropdownHtml(location_id));
    item.exists = false;
  })
  $(document).off("change", "#add_crop_id");
  $(document).on("change",'#add_crop_id',async function()
  {
    let crop_id=$(this).val();
    let html='<option value="">'+labels.get('label_select')+'</option>';
    for(let i in taskData.crop_types){
      let crop_type=taskData.crop_types[i];
      if(crop_type['crop_id']==crop_id){
        html+=('<option value="'+crop_type['id']+'">'+crop_type['name']+'</option>');
      }
    }
    $('#add_type_id').html(html);
  })
  $(document).off("change", "#add_type_id");
  $(document).on("change",'#add_type_id',async function()
  {
    let type_id=$(this).val();
    let html='<option value="">'+labels.get('label_select')+'</option>';
    for(let i in taskData.varieties_arm_typewise_ordered[type_id]){
      let variety=taskData.varieties_arm_typewise_ordered[type_id][i];
      html+=('<option value="'+variety['id']+'">'+variety['name']+'</option>');
    }
    $('#arm_variety_id').html(html);
    html='<option value="">'+labels.get('label_select')+'</option>';
    for(let i in taskData.varieties_competitor_typewise_ordered[type_id]){
      let variety=taskData.varieties_competitor_typewise_ordered[type_id][i];
      html+=('<option value="'+variety['id']+'">'+variety['name']+'</option>');
    }
    $('#competitor_variety_id').html(html);
  })

});
</script>