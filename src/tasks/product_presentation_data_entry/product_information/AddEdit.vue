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
        <div class="row">
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_part_name')}}</label>
              </div>
              <div class="col-8">
                <div class="input-group">
                  <select id="add_part_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_area_name')}}</label>
              </div>
              <div class="col-8">
                <div class="input-group">
                  <select id="add_area_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_territory_name')}}</label>
              </div>
              <div class="col-8">
                <div class="input-group">
                  <select id="add_territory_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_upazila_id')}}</label>
              </div>
              <div class="col-8">
                <div class="input-group">
                  <select id="add_upazila_id" class="form-control" name="item[upazila_id]">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      <div v-if="item.id>0">{{labels.get('label_edit_task')}}({{item.id}})</div>
      <div v-else>{{labels.get('label_new_task')}}</div>
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <InputTemplate :inputItems="item.inputFields" />
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">Images</label>
          </div>
          <div class="col-lg-4 col-8">
            <div class="row mb-2">
              <div class="col-12">
                <div class="input-group input-group-sm">
                  <div class="input-group-prepend">
                    <label class="btn btn-sm bg-gradient-primary" style="cursor: pointer;">
                      <input id="picture_farmer" type="file" class="d-none" name="pics[]" multiple data-preview-container="#picture_farmer_preview_container_">
                      <i class="bi bi-upload"></i> Select File
                    </label>
                  </div>
                  <label class="form-control custom-file-name"></label>
                  <div class="input-group-append clear_file">
                    <label class="btn btn-sm bg-gradient-info" style="cursor: pointer;">clear</label>
                  </div><input id="picture_farmer_file_input" type="hidden" name="item[picture_farmer]">
                </div>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-12 system_preview_container" id="picture_farmer_preview_container_">
                <img style="max-width: 100%; max-height: 200px;" src="/theme/images/no_image.jpg">
              </div>
            </div>
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
  // item.inputFields= {};
  // await systemFunctions.delay(1);
  // let inputFields={}
  // let key='save_token';
  // inputFields[key] = {
  //   name: key,
  //   label: labels.get('label_'+key),
  //   type:'hidden',
  //   default:new Date().getTime(),
  //   mandatory:true
  // };
  // key='picture_farmer';
  // inputFields[key] = {
  //   name: 'item[' +key +']',
  //   label: labels.get('label_'+key),
  //   type:'image',
  //   default:'',
  //   mandatory:true,
  //   more_values:['x','y'],
  //
  // };
  //
  // item.inputFields=inputFields;


}
const save=async (save_and_new)=>{
  let saveData=false;
  //let fileFormData=await systemFunctions.getImageFormData('formSaveItem');
  let fileFormData=new FormData(document.getElementById('formSaveItem'))
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
        // for(let key in uploadData){
        //   $('#'+key+'_file_input').val(uploadData[key].path)
        // }
        saveData=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
    //console.log(fileFormData.entries())
  }
  // let formData=new FormData(document.getElementById('formSaveItem'))
  // await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
  //   if (res.data.error == "") {
  //     globalVariables.loadListData=true;
  //     toastFunctions.showSuccessfullySavedMessage();
  //     if(save_and_new){
  //       if(item.id>0){
  //         router.push(taskData.api_url+"/add")
  //       }
  //       else{
  //         setInputFields();
  //       }
  //     }
  //     else{
  //       router.push(taskData.api_url)
  //     }
  //   }
  //   else{
  //     toastFunctions.showResponseError(res.data)
  //   }
  // });

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
});
</script>