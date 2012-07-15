

/* this ALWAYS GENERATED file contains the IIDs and CLSIDs */

/* link this file in with the server and any clients */


 /* File created by MIDL compiler version 7.00.0555 */
/* at Sun Jul 15 14:30:20 2012
 */
/* Compiler settings for BHO5.idl:
    Oicf, W1, Zp8, env=Win32 (32b run), target_arch=X86 7.00.0555 
    protocol : dce , ms_ext, c_ext, robust
    error checks: allocation ref bounds_check enum stub_data 
    VC __declspec() decoration level: 
         __declspec(uuid()), __declspec(selectany), __declspec(novtable)
         DECLSPEC_UUID(), MIDL_INTERFACE()
*/
/* @@MIDL_FILE_HEADING(  ) */

#pragma warning( disable: 4049 )  /* more than 64k source lines */


#ifdef __cplusplus
extern "C"{
#endif 


#include <rpc.h>
#include <rpcndr.h>

#ifdef _MIDL_USE_GUIDDEF_

#ifndef INITGUID
#define INITGUID
#include <guiddef.h>
#undef INITGUID
#else
#include <guiddef.h>
#endif

#define MIDL_DEFINE_GUID(type,name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8) \
        DEFINE_GUID(name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8)

#else // !_MIDL_USE_GUIDDEF_

#ifndef __IID_DEFINED__
#define __IID_DEFINED__

typedef struct _IID
{
    unsigned long x;
    unsigned short s1;
    unsigned short s2;
    unsigned char  c[8];
} IID;

#endif // __IID_DEFINED__

#ifndef CLSID_DEFINED
#define CLSID_DEFINED
typedef IID CLSID;
#endif // CLSID_DEFINED

#define MIDL_DEFINE_GUID(type,name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8) \
        const type name = {l,w1,w2,{b1,b2,b3,b4,b5,b6,b7,b8}}

#endif !_MIDL_USE_GUIDDEF_

MIDL_DEFINE_GUID(IID, IID_IComponentRegistrar,0xa817e7a2,0x43fa,0x11d0,0x9e,0x44,0x00,0xaa,0x00,0xb6,0x77,0x0a);


MIDL_DEFINE_GUID(IID, IID_IRESBHO,0x2A99AF00,0x021E,0x4F08,0xBC,0x81,0x77,0xF5,0xDF,0xCB,0x4D,0x6E);


MIDL_DEFINE_GUID(IID, LIBID_BHO5Lib,0x1D79FD4E,0x045B,0x4CE8,0x8F,0xBE,0x73,0xAC,0xA8,0x27,0xBF,0x5F);


MIDL_DEFINE_GUID(CLSID, CLSID_CompReg,0xBB019707,0x32A8,0x45EA,0xAA,0xFA,0xF6,0x62,0x0A,0xFA,0x38,0xCA);


MIDL_DEFINE_GUID(CLSID, CLSID_RESBHO,0xE3A3FEA8,0xE3D0,0x4888,0xBD,0xAF,0xBC,0x66,0x91,0x56,0x42,0x88);

#undef MIDL_DEFINE_GUID

#ifdef __cplusplus
}
#endif



